// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { TOP_100_INDEXERS, useSQToken } from '@containers';
import { l2Chain, useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { parseRawEraValue } from '@hooks/useEraValue';
import { useEthersProviderWithPublic } from '@hooks/useEthersProvider';
import { getTotalStake } from '@hooks/useSortedIndexer';
import {
  formatEther,
  formatSQT,
  useGetFilteredDelegationsLazyQuery,
  useGetIndexerLazyQuery,
  useGetRewardsLazyQuery,
} from '@subql/react-hooks';
import { convertBigNumberToNumber, numToHex } from '@utils';
import { idleCallback, idleQueue } from '@utils/idleCallback';
import { limitContract, makeCacheKey } from '@utils/limitation';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';

import { useWeb3Store } from 'src/stores';
import { NotificationKey, useNotification } from 'src/stores/notification';

import { CanRenderOnNotification } from '.';

const defaultDismissTime = 1000 * 60 * 60 * 24;

// can be split into multiple hooks
// those notification function not depend on each other
export const useMakeNotification = () => {
  const notificationStore = useNotification();
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const provider = useEthersProviderWithPublic({ chainId: l2Chain.id });
  const { account } = useAccount();
  const [fetchRewardsApi] = useGetRewardsLazyQuery();
  const [fetchIndexerData] = useGetIndexerLazyQuery();
  const [fetchIndexerController] = useLazyQuery<{ indexer?: { controller?: string } }>(gql`
    query Indexer($address: String!) {
      indexer(id: $address) {
        controller
      }
    }
  `);
  const [fetchUnlockWithdrawal] = useLazyQuery<{ withdrawls: { totalCount?: number } }>(gql`
    query MyQuery($address: String!, $startTime: Datetime!) {
      withdrawls(
        filter: {
          delegator: { equalTo: $address }
          status: { equalTo: ONGOING }
          startTime: { lessThanOrEqualTo: $startTime }
        }
      ) {
        totalCount
      }
    }
  `);
  const [fetchAllocationProjects] = useLazyQuery<{
    indexerAllocationSummaries: { nodes: { deploymentId: string; project: { deploymentId: string } }[] };
  }>(gql`
    query GetIndexerAllocationProjects($id: String!) {
      indexerAllocationSummaries(filter: { indexerId: { equalTo: $id }, totalAmount: { greaterThan: "0" } }) {
        nodes {
          deploymentId
          project {
            deploymentId
          }
        }
      }
    }
  `);
  const [fetchBooster] = useLazyQuery<{
    deploymentBoosterSummaries?: {
      groupedAggregates?: {
        sum?: {
          totalAmount?: string;
        };
        keys?: string[];
      }[];
    };
  }>(gql`
    query GetBooster($deploymentIds: [String!]) {
      deploymentBoosterSummaries(filter: { deploymentId: { in: $deploymentIds } }) {
        groupedAggregates(groupBy: DEPLOYMENT_ID) {
          sum {
            totalAmount
          }
          keys
        }
      }
    }
  `);
  const [fetchTerminatedProjects] = useLazyQuery<{ indexerDeployments: { totalCount?: number } }>(gql`
    query GetTerminatedProjects($indexerId: String!, $deploymentIds: [String!]!) {
      indexerDeployments(
        filter: {
          indexerId: { equalTo: $indexerId }
          deploymentId: { in: $deploymentIds }
          status: { equalTo: TERMINATED }
        }
      ) {
        totalCount
      }
    }
  `);
  const [fetchUnhealthyAllocation] = useLazyQuery<{ getIndexerServicesStatuses: { endpointSuccess: boolean }[] }>(
    gql`
      query GetIndexerServicesStatuses($indexer: String!) {
        getIndexerServicesStatuses(
          indexer: $indexer
          filter: { allocationAmount: { greaterThan: "0" }, endpointSuccess: { equalTo: false } }
        ) {
          endpointSuccess
        }
      }
    `,
    {
      context: {
        clientName: TOP_100_INDEXERS,
      },
    },
  );

  const [fetchPreviousEra] = useLazyQuery<{ eras: { nodes: { createdBlock: number }[] } }>(gql`
    query GetPreviousEra($eraId: String!) {
      eras(filter: { id: { equalTo: $eraId } }) {
        nodes {
          createdBlock
        }
      }
    }
  `);

  const [fetchNewOperators] = useLazyQuery<{ indexers: { nodes: { id: string; metadata: string }[] } }>(gql`
    query GetNewOperators($block: Int!) {
      indexers(filter: { active: { equalTo: true }, createdBlock: { greaterThan: $block } }) {
        nodes {
          id
          metadata
        }
      }
    }
  `);
  const { consumerHostBalance } = useSQToken();
  const { getHostingPlanApi } = useConsumerHostServices({
    autoLogin: false,
  });

  const [fetchDelegations] = useGetFilteredDelegationsLazyQuery();

  const checkIfExistAndExpired = useCallback(
    (notificationKeys: NotificationKey | NotificationKey[]) => {
      const keys = Array.isArray(notificationKeys) ? notificationKeys : [notificationKeys];

      const exist = keys.every((key) => notificationStore.notificationList.find((item) => item.key === key));

      if (exist) {
        const exipred = keys.some((key) => {
          const item = notificationStore.notificationList.find((item) => item.key === key);
          if (!item) return false;
          return item.dismissTo && item.dismissTo < Date.now();
        });

        return {
          exist: true,
          expired: exipred,
        };
      }

      return {
        exist,
        expired: false,
      };
    },
    [notificationStore.notificationList],
  );

  const makeOverAllocateAndUnStakeAllocationNotification = useCallback(
    async (mode?: 'reload') => {
      // over and unused share same api, so must query both at the same time
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired([
          NotificationKey.OverAllocate,
          NotificationKey.OverAllocateNextEra,
          NotificationKey.UnstakeAllocation,
        ]);
        if (exist && !expired) {
          return;
        }
      }

      const isIndexer = await contracts?.indexerRegistry.isIndexer(account || '');
      if (!isIndexer) return;

      const res = await contracts?.stakingAllocation.runnerAllocation(account || '');
      const runnerAllocation = {
        used: formatSQT(res?.used.toString() || '0'),
        total: formatSQT(res?.total.toString() || '0'),
      };

      const isOverAllocated = +runnerAllocation?.used > +runnerAllocation?.total;
      const isUnused = +runnerAllocation.total - +runnerAllocation.used > 1000;

      const { exist: unstakeExist, expired: unstakeExpire } = checkIfExistAndExpired(NotificationKey.UnstakeAllocation);
      if (isUnused && (mode === 'reload' || !unstakeExist || unstakeExpire)) {
        // add a notification to inform user that they have unused allocation
        notificationStore.addNotification({
          key: NotificationKey.UnstakeAllocation,
          level: 'critical',
          message: `You have stake not allocated to any projects.\n\nAllocate them to increase rewards for yourself and any delegators`,
          title: 'Unallocated Stake',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Allocate Stake',
            navigateHref: '/indexer/my-projects',
          },
        });
      }

      if (!isUnused && unstakeExist && !unstakeExpire) {
        notificationStore.removeNotification(NotificationKey.UnstakeAllocation);
      }

      const { exist: overAllocateExist, expired: overAllocateExpire } = checkIfExistAndExpired(
        NotificationKey.OverAllocate,
      );
      if (isOverAllocated && (mode === 'reload' || !overAllocateExist || overAllocateExpire)) {
        notificationStore.addNotification({
          key: NotificationKey.OverAllocate,
          level: 'critical',
          message: `Your stake is over allocated for the current era and risk having your rewards burned.\n\nRemove Allocation from your projects to restore rewards`,
          title: 'Stake Over Allocated',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Adjust Allocation',
            navigateHref: '/indexer/my-projects',
          },
        });
      }

      if (!isOverAllocated && overAllocateExist && !overAllocateExpire) {
        notificationStore.removeNotification(NotificationKey.OverAllocate);
      }

      // TODO: think about a more efficient way to check this
      // refresh all the time for now.
      // if (mode === 'reload' || !overAllocateNextExist || overAllocateNextExpire) {
      const indexerData = await fetchIndexerData({
        variables: {
          address: account || '',
        },
        fetchPolicy: 'network-only',
      });
      if (indexerData.data?.indexer?.id) {
        const totalStake = getTotalStake(indexerData.data.indexer.totalStake, currentEra.data?.index);

        if (totalStake.after && BigNumberJs(totalStake.after).lt(runnerAllocation.used)) {
          // add notification to inform user that they may over allocated next era
          notificationStore.addNotification({
            key: NotificationKey.OverAllocateNextEra,
            level: 'info',
            message: `Your stake is over allocated for the next era and risk having your rewards burned.\n\nRemove Allocation from your projects to restore rewards`,
            title: 'Stake Over Allocated Next Era',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: 1000, // 1 hour
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Adjust Allocation',
              navigateHref: '/indexer/my-projects',
            },
          });
        } else {
          notificationStore.removeNotification(NotificationKey.OverAllocateNextEra);
        }
        // }
      }
    },
    [account, contracts, notificationStore.notificationList, currentEra.data?.index],
  );

  const makeOutdateAllocationProjects = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired([
          NotificationKey.OutdatedAllocationV2,
          NotificationKey.MislaborAllocation,
        ]);
        if (exist && !expired) {
          return;
        }
      }

      const res = await fetchAllocationProjects({
        variables: {
          id: account || '',
        },
      });

      const { exist: outdatedExist, expired: outdatedExpired } = checkIfExistAndExpired([
        NotificationKey.OutdatedAllocationV2,
      ]);

      if (mode === 'reload' || !outdatedExist || outdatedExpired) {
        const newVersionOfProject = res.data?.indexerAllocationSummaries?.nodes
          .filter((node) => node?.deploymentId !== node?.project?.deploymentId)
          // first is previous deploymentId, second is current deploymentId
          .map((i) => [i?.deploymentId, i?.project?.deploymentId]);

        if (!newVersionOfProject?.length) return;

        const boosterRes = await fetchBooster({
          variables: {
            deploymentIds: newVersionOfProject.flat(),
          },
        });

        const outdatedDeployment = newVersionOfProject.filter((i) => {
          const [previous, current] = i;
          const previousBooster = BigNumberJs(
            boosterRes.data?.deploymentBoosterSummaries?.groupedAggregates?.find((i) => i.keys?.includes(previous))?.sum
              ?.totalAmount || 0,
          );

          const currentBooster = BigNumberJs(
            boosterRes.data?.deploymentBoosterSummaries?.groupedAggregates?.find((i) => i.keys?.includes(current))?.sum
              ?.totalAmount || 0,
          );

          if (currentBooster.gt(previousBooster)) {
            return true;
          }
          return false;
        });

        if (outdatedDeployment?.length) {
          notificationStore.addNotification({
            key: NotificationKey.OutdatedAllocationV2,
            level: 'critical',
            message: `You have allocated to a outdated deployment. Please adjust your allocation to the latest version.\nOutdated deployment id: ${outdatedDeployment.map((i) => i[0]).join('\n')}`,
            title: 'Outdated Project Allocation',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Adjust Allocation',
              navigateHref: '/indexer/my-projects',
            },
          });
        }
      }

      const { exist: misLaborExist, expired: misLaborExpired } = checkIfExistAndExpired([
        NotificationKey.MislaborAllocation,
      ]);
      if (mode === 'reload' || !misLaborExist || misLaborExpired) {
        const allocatedDeployments = res.data?.indexerAllocationSummaries.nodes.map((i) => i?.deploymentId);
        const terminatedProjects = await fetchTerminatedProjects({
          variables: {
            indexerId: account || '',
            deploymentIds: allocatedDeployments,
          },
        });

        if (terminatedProjects.data?.indexerDeployments.totalCount) {
          notificationStore.addNotification({
            key: NotificationKey.MislaborAllocation,
            level: 'info',
            message: `You have allocated to a terminated deployment. Terminated deployment will not receive rewards.`,
            title: 'Mislabor Allocation Projects',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Adjust Allocation',
              navigateHref: '/indexer/my-projects',
            },
          });
        }
      }
    },
    [account, notificationStore.notificationList],
  );

  const makeUnClaimedNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.UnclaimedRewards);
        if (exist && !expired) {
          return;
        }
      }

      const res = await fetchRewardsApi({
        variables: {
          address: account || '',
        },
        fetchPolicy: 'network-only',
      });

      if (res.data?.unclaimedRewards?.totalCount) {
        notificationStore.addNotification({
          key: NotificationKey.UnclaimedRewards,
          level: 'info',
          message: 'You have rewards available to claim',
          title: 'Unclaimed Rewards',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Claim Rewards',
            navigateHref: '/profile/rewards',
          },
        });
      }
    },
    [account, notificationStore.notificationList],
  );

  const makeLowBillingBalanceNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.LowBillingBalance);

        if (exist && !expired) {
          return;
        }
      }

      const hostingPlan = await getHostingPlanApi({ account: account || '' });
      if (!hostingPlan?.data?.length) {
        return;
      }

      const res = await consumerHostBalance?.refetch();
      const [billingBalance] = res?.data || [];
      if (
        !BigNumberJs(formatSQT(billingBalance?.toString() || '0')).isZero() &&
        BigNumberJs(formatSQT(billingBalance?.toString() || '0')).lt(400)
      ) {
        notificationStore.addNotification({
          key: NotificationKey.LowBillingBalance,
          level: 'critical',
          message:
            'Your Billing account balance is running low. Please top up your Billing account promptly to avoid any disruption in usage.',
          title: 'Low Billing Balance',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Add Balance',
            navigateHref: '/consumer/flex-plans/ongoing',
          },
        });
      }
    },
    [account, notificationStore.notificationList],
  );

  const makeInactiveOperatorNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.LowBillingBalance);

        if (exist && !expired) return;
      }
      const res = await fetchDelegations({
        variables: { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 },
      });

      if (
        res.data?.delegations?.nodes.some(
          (i) => i?.indexer?.active === false && parseRawEraValue(i.amount, currentEra.data?.index)?.after?.gt(0),
        )
      ) {
        notificationStore.addNotification({
          key: NotificationKey.InactiveOperator,
          level: 'critical',
          message:
            'One or more of the Node Operators you delegate to has unregistered from SubQuery Network and you are receiving no more rewards.\n\n You should redelegate your SQT to another Node Operator to continue to receive rewards.',
          title: 'Delegated Node Operator Inactive',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Change Delegation',
            navigateHref: '/delegator/my-delegation',
          },
        });
      }
    },
    [account, notificationStore.notificationList, currentEra.data?.index],
  );

  const makeLowControllerBalanceNotification = useCallback(
    async (mode?: 'reload') => {
      const res = await fetchIndexerController({
        variables: {
          address: account || '',
        },
        fetchPolicy: 'network-only',
      });

      if (res.data?.indexer?.controller) {
        const controller = res.data.indexer.controller;
        const controllerBalance = await provider?.getBalance(controller);

        if (BigNumberJs(formatEther(controllerBalance)).lt(0.001)) {
          notificationStore.addNotification({
            key: NotificationKey.LowControllerBalance,
            level: 'critical',
            message:
              'Your Controller Account’s balance is running low. Top up now to ensure rewards are paid out in time.',
            title: 'Low Controller Account Balance',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: '',
              navigateHref: '',
            },
          });
        } else {
          notificationStore.removeNotification(NotificationKey.LowControllerBalance);
        }
      }
    },
    [account, notificationStore.notificationList, provider],
  );

  const makeUnlockWithdrawalNotification = useCallback(
    async (mode?: 'reload') => {
      if (!contracts) return;
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.UnlockWithdrawal);

        if (exist && !expired) {
          return;
        }
      }
      const lockPeriod = await limitContract(() => contracts.staking.lockPeriod(), makeCacheKey('lockPeriod'), 0);
      const res = await fetchUnlockWithdrawal({
        variables: {
          address: account || '',
          startTime: dayjs().subtract(convertBigNumberToNumber(lockPeriod), 'seconds').toISOString(),
        },
        fetchPolicy: 'network-only',
      });

      if (res.data?.withdrawls.totalCount) {
        notificationStore.addNotification({
          key: NotificationKey.UnlockWithdrawal,
          level: 'info',
          message: 'You have unlocked withdrawals available',
          title: 'Unlocked Withdrawals',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Withdraw',
            navigateHref: '/profile/withdrawn',
          },
        });
      }
    },
    [account, notificationStore.notificationList, contracts],
  );

  const makeUnhealthyAllocationNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.UnhealthyAllocation);
        if (exist && !expired) return;
      }

      const res = await fetchUnhealthyAllocation({
        variables: {
          indexer: account || '',
        },
        fetchPolicy: 'network-only',
      });

      if (res.data?.getIndexerServicesStatuses.some((i) => i.endpointSuccess === false)) {
        notificationStore.addNotification({
          key: NotificationKey.UnhealthyAllocation,
          level: 'critical',
          message:
            'One or more of the projects you run is currently unhealthy.\n\nYou, along with any delegators, will not receive rewards for this project and risk having your rewards burned.',
          title: 'Project Unhealthy',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: 60 * 1000 * 30, // 30 min
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'View Projects',
            navigateHref: '/indexer/my-projects',
          },
        });
      }
    },
    [account, notificationStore.notificationList],
  );

  const makeInOrDecreaseCommissionNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired([
          NotificationKey.DecreaseCommissionRate,
          NotificationKey.IncreaseCommissionRate,
        ]);

        if (exist && !expired) {
          return;
        }
      }

      const res = await fetchDelegations({
        variables: { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 },
      });

      if (res.data?.delegations?.totalCount) {
        const delegations = res.data.delegations.nodes;
        const hasDecreaseCommission = delegations.some((delegation) => {
          const eraValue = parseRawEraValue(delegation?.indexer?.commission, currentEra.data?.index);
          return eraValue.after?.lt(eraValue.current);
        });

        const hasIncreaseCommission = delegations.some((delegation) => {
          const eraValue = parseRawEraValue(delegation?.indexer?.commission, currentEra.data?.index);
          return eraValue.after?.gt(eraValue.current);
        });

        const { exist: decreaseExist, expired: decreaseExpired } = checkIfExistAndExpired(
          NotificationKey.DecreaseCommissionRate,
        );

        if ((!decreaseExist || decreaseExpired || mode === 'reload') && hasDecreaseCommission) {
          notificationStore.addNotification({
            key: NotificationKey.DecreaseCommissionRate,
            level: 'info',
            message:
              'One or more Node Operators you delegate to is planning to decrease their commission rate, you might want to review your current delegation settings to take advantage of this.',
            title: 'Commission Rate Decreasing',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Review Delegation',
              navigateHref: '/delegator/my-delegation',
            },
          });
        }

        if (decreaseExist && !decreaseExpired && !hasDecreaseCommission) {
          notificationStore.removeNotification(NotificationKey.DecreaseCommissionRate);
        }

        const { exist: increaseExist, expired: increaseExpired } = checkIfExistAndExpired(
          NotificationKey.IncreaseCommissionRate,
        );

        if ((!increaseExist || increaseExpired || mode === 'reload') && hasIncreaseCommission) {
          notificationStore.addNotification({
            key: NotificationKey.IncreaseCommissionRate,
            level: 'info',
            message:
              'One or more Node Operators you delegate to is planning to increase their commission rate, you might want to review your current delegation settings to reassess delegation.',
            title: 'Commission Rate Increasing',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Review Delegation',
              navigateHref: '/delegator/my-delegation',
            },
          });
        }

        if (increaseExist && !increaseExpired && !hasIncreaseCommission) {
          notificationStore.removeNotification(NotificationKey.IncreaseCommissionRate);
        }
      }
    },
    [account, notificationStore.notificationList, currentEra.data?.index],
  );

  const makeNewOperatorNotification = useCallback(async () => {
    const res = await fetchPreviousEra({
      variables: {
        eraId: numToHex((currentEra.data?.index || 0) - 1),
      },
    });

    if (res.data?.eras.nodes[0]) {
      const { createdBlock } = res.data.eras.nodes[0];
      const newOperators = await fetchNewOperators({
        variables: {
          block: createdBlock,
        },
      });

      const count = newOperators.data?.indexers.nodes.length;
      if (count) {
        notificationStore.addNotification(
          {
            key: NotificationKey.NewOperator,
            level: 'info',
            message: `${count} new Node Operators ${
              count > 1 ? 'have' : 'has'
            } joined the SubQuery Network.\n\n${newOperators.data?.indexers.nodes
              .map(
                (i) =>
                  `{{ {"componentKey": "${CanRenderOnNotification.ConnectedIndexer}", "componentProps": { "id": "${i.id}", "size": "small", "clickToProfile": true } } }}`,
              )
              .join('\n')}`,
            title: 'New Node Operators',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'View New Operators',
              navigateHref: '/delegator/node-operators/all',
            },
          },
          true,
        );
      } else {
        notificationStore.removeNotification(NotificationKey.NewOperator);
      }
    }
  }, [currentEra.data?.index, notificationStore.notificationList]);

  const initAllNotification = useCallback(() => {
    idleCallback(() =>
      idleQueue([
        // use this sort to make sure the most important notification show first
        //
        () => makeOverAllocateAndUnStakeAllocationNotification(),
        () => makeLowControllerBalanceNotification(),
        () => makeUnhealthyAllocationNotification(),
        () => makeInactiveOperatorNotification(),
        () => makeLowBillingBalanceNotification(),
        () => makeUnlockWithdrawalNotification(),
        () => makeUnClaimedNotification(),
        () => makeInOrDecreaseCommissionNotification(),
        () => makeOutdateAllocationProjects(),
        () => makeNewOperatorNotification(),
      ]),
    );
  }, [
    makeOverAllocateAndUnStakeAllocationNotification,
    makeUnClaimedNotification,
    makeLowBillingBalanceNotification,
    makeInactiveOperatorNotification,
    makeLowControllerBalanceNotification,
    makeUnlockWithdrawalNotification,
    makeOutdateAllocationProjects,
    makeUnhealthyAllocationNotification,
    makeInOrDecreaseCommissionNotification,
    makeNewOperatorNotification,
  ]);

  return {
    makeOverAllocateAndUnStakeAllocationNotification: () =>
      idleCallback(() => makeOverAllocateAndUnStakeAllocationNotification()),
    makeUnClaimedNotification: () => idleCallback(() => makeUnClaimedNotification()),
    makeLowBillingBalanceNotification: () => idleCallback(() => makeLowBillingBalanceNotification()),
    makeInactiveOperatorNotification: () => idleCallback(() => makeInactiveOperatorNotification()),
    makeLowControllerBalanceNotification: () => idleCallback(() => makeLowControllerBalanceNotification()),
    makeUnlockWithdrawalNotification: () => idleCallback(() => makeUnlockWithdrawalNotification()),
    makeOutdateAllocationProjects: () => idleCallback(() => makeOutdateAllocationProjects()),
    makeUnhealthyAllocationNotification: () => idleCallback(() => makeUnhealthyAllocationNotification()),
    makeInOrDecreaseCommissionNotification: () => idleCallback(() => makeInOrDecreaseCommissionNotification()),

    refreshAndMakeOverAllocateNotification: () => {
      notificationStore.removeNotification([
        NotificationKey.OverAllocate,
        NotificationKey.OverAllocateNextEra,
        NotificationKey.UnstakeAllocation,
      ]);
      idleCallback(() => makeOverAllocateAndUnStakeAllocationNotification('reload'));
    },
    refreshAndMakeUnClaimedNotification: () => {
      notificationStore.removeNotification(NotificationKey.UnclaimedRewards);
      idleCallback(() => makeUnClaimedNotification('reload'));
    },
    refreshAndMakeLowBillingBalanceNotification: () => {
      notificationStore.removeNotification(NotificationKey.LowBillingBalance);
      idleCallback(() => makeLowBillingBalanceNotification('reload'));
    },
    refreshAndMakeInactiveOperatorNotification: () => {
      notificationStore.removeNotification(NotificationKey.InactiveOperator);
      idleCallback(() => makeInactiveOperatorNotification('reload'));
    },
    refreshAndMakeLowControllerBalanceNotification: () => {
      notificationStore.removeNotification(NotificationKey.LowControllerBalance);
      idleCallback(() => makeLowControllerBalanceNotification('reload'));
    },
    refreshAndMakeUnlockWithdrawalNotification: () => {
      notificationStore.removeNotification(NotificationKey.UnlockWithdrawal);
      idleCallback(() => makeUnlockWithdrawalNotification('reload'));
    },
    refreshAndMakeOutdateAllocationProjects: () => {
      notificationStore.removeNotification([
        NotificationKey.OutdatedAllocation,
        NotificationKey.OutdatedAllocationV2,
        NotificationKey.MislaborAllocation,
      ]);
      idleCallback(() => makeOutdateAllocationProjects('reload'));
    },
    refreshAndMakeUnhealthyAllocationNotification: () => {
      notificationStore.removeNotification(NotificationKey.UnhealthyAllocation);
      idleCallback(() => makeUnhealthyAllocationNotification('reload'));
    },
    refreshAndMakeInOrDecreaseCommissionNotification: () => {
      notificationStore.removeNotification([
        NotificationKey.DecreaseCommissionRate,
        NotificationKey.IncreaseCommissionRate,
      ]);
      idleCallback(() => makeInOrDecreaseCommissionNotification('reload'));
    },
    initNewNotification: () => idleCallback(initAllNotification),
  };
};
