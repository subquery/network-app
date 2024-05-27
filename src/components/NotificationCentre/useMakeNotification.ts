// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useSQToken } from '@containers';
import { useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { useEthersSigner } from '@hooks/useEthersProvider';
import { getTotalStake } from '@hooks/useSortedIndexer';
import {
  formatEther,
  formatSQT,
  useGetFilteredDelegationsLazyQuery,
  useGetIndexerLazyQuery,
  useGetRewardsLazyQuery,
} from '@subql/react-hooks';
import { convertBigNumberToNumber } from '@utils';
import { limitContract, makeCacheKey } from '@utils/limitation';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';

import { useWeb3Store } from 'src/stores';
import { NotificationKey, useNotification } from 'src/stores/notification';

const idleTimeout = (func: () => void) => setTimeout(func, 200);
const idleCallback = window.requestIdleCallback || idleTimeout;

export const useMakeNotification = () => {
  const notificationStore = useNotification();
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const { provider } = useEthersSigner();
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
  const { consumerHostBalance } = useSQToken();
  const { getHostingPlanApi } = useConsumerHostServices({
    autoLogin: false,
  });

  // TODO: filter inactive by Graphql
  const [fetchDelegations] = useGetFilteredDelegationsLazyQuery();

  const makeOverAllocateAndUnStakeAllocationNotification = useCallback(
    async (mode?: 'reload') => {
      // over and unused share same api, so must query both at the same time
      // TODO: Maybe can optimise
      if (mode !== 'reload') {
        if (
          notificationStore.notificationList.find((item) => item.key === NotificationKey.OverAllocate) &&
          notificationStore.notificationList.find((item) => item.key === NotificationKey.UnstakeAllocation) &&
          notificationStore.notificationList.find((item) => item.key === NotificationKey.OverAllocateNextEra)
        ) {
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
      if (
        isUnused &&
        (mode === 'reload' ||
          !notificationStore.notificationList.find((item) => item.key === NotificationKey.UnstakeAllocation))
      ) {
        // add a notification to inform user that they have unused allocation
        notificationStore.addNotification({
          key: 'unstakeAllocation',
          level: 'info',
          message: `You have ${+runnerAllocation.total - +runnerAllocation.used} SQT unused`,
          title: 'Unused Allocation',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: 1000 * 60 * 60 * 24,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Adjust Allocation',
            navigateHref: '/indexer/my-projects',
          },
        });
      }
      if (
        isOverAllocated &&
        (mode === 'reload' ||
          !notificationStore.notificationList.find((item) => item.key === NotificationKey.OverAllocate))
      ) {
        notificationStore.addNotification({
          key: 'overAllocate',
          level: 'critical',
          message: `You have used ${runnerAllocation.used} SQT out of ${runnerAllocation.total} SQT allocated`,
          title: 'Over Allocation',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: 1000 * 60 * 60 * 24,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Adjust Allocation',
            navigateHref: '/indexer/my-projects',
          },
        });
        notificationStore.sortNotificationList();
      }

      if (
        mode === 'reload' ||
        !notificationStore.notificationList.find((item) => item.key === NotificationKey.OverAllocateNextEra)
      ) {
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
              key: 'overAllocateNextEra',
              level: 'info',
              message: `You have used ${runnerAllocation.used} SQT out of ${totalStake.after} SQT allocated in the next era`,
              title: 'Over Allocation Next Era',
              createdAt: Date.now(),
              canBeDismissed: true,
              dismissTime: 1000 * 60 * 60 * 24,
              dismissTo: undefined,
              type: '',
              buttonProps: {
                label: 'Adjust Allocation',
                navigateHref: '/indexer/my-projects',
              },
            });
          }
        }
      }
    },
    [account, contracts, notificationStore.notificationList, currentEra.data?.index],
  );

  const makeOutdateAllocationProjects = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        if (
          notificationStore.notificationList.find((item) => item.key === NotificationKey.OutdatedAllocation) &&
          notificationStore.notificationList.find((item) => item.key === NotificationKey.MislaborAllocation)
        ) {
          return;
        }
      }

      const res = await fetchAllocationProjects({
        variables: {
          id: account || '',
        },
        fetchPolicy: 'network-only',
      });

      if (!notificationStore.notificationList.find((item) => item.key === NotificationKey.OutdatedAllocation)) {
        const newVersionOfProject = res.data?.indexerAllocationSummaries?.nodes
          .filter((node) => node?.deploymentId !== node?.project?.deploymentId)
          .map((i) => i?.project?.deploymentId);

        if (!newVersionOfProject?.length) return;

        const boosterRes = await fetchBooster({
          variables: {
            deploymentIds: newVersionOfProject,
          },
        });

        const haveBoosterProjects = boosterRes.data?.deploymentBoosterSummaries?.groupedAggregates?.filter((i) => {
          return i.sum?.totalAmount && BigNumberJs(i.sum.totalAmount).gt(0);
        });

        if (haveBoosterProjects?.length) {
          notificationStore.addNotification({
            key: NotificationKey.OutdatedAllocation,
            level: 'info',
            message: `You have allocated to a outdated deployment. Please adjust your allocation to the latest version.`,
            title: 'Outdated Allocation Projects',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: 1000 * 60 * 60 * 24,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Adjust Allocation',
              navigateHref: '/indexer/my-projects',
            },
          });
        }
      }

      if (!notificationStore.notificationList.find((item) => item.key === NotificationKey.MislaborAllocation)) {
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
            dismissTime: 1000 * 60 * 60 * 24,
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
        if (notificationStore.notificationList.find((item) => item.key === NotificationKey.UnclaimedRewards)) {
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
          message: '',
          title: 'Unclaimed Rewards',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: 1000 * 60 * 60 * 24,
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
        if (notificationStore.notificationList.find((item) => item.key === NotificationKey.LowBillingBalance)) {
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
          dismissTime: 1000 * 60 * 60 * 24,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Add Balance',
            navigateHref: '/consumer/flex-plans/ongoing',
          },
        });
        notificationStore.sortNotificationList();
      }
    },
    [account, notificationStore.notificationList],
  );

  const makeInactiveOperatorNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        if (notificationStore.notificationList.find((item) => item.key === NotificationKey.InactiveOperator)) return;
      }
      const res = await fetchDelegations({
        variables: { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 },
        fetchPolicy: 'network-only',
      });

      if (res.data?.delegations?.nodes.some((i) => i?.indexer?.active === false)) {
        notificationStore.addNotification({
          key: NotificationKey.InactiveOperator,
          level: 'critical',
          message:
            'This node operator has unregistered from SubQuery Network and you are receiving no more rewards. You should redelegate your SQT to another Node Operator to continue to receive rewards.',
          title: 'Node Operator Inactive',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: 1000 * 60 * 60 * 24,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'Change Delegation',
            navigateHref: '/delegator/my-delegation',
          },
        });
        notificationStore.sortNotificationList();
      }
    },
    [account, notificationStore.notificationList],
  );

  const makeLowControllerBalanceNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        if (notificationStore.notificationList.find((item) => item.key === NotificationKey.LowControllerBalance)) {
          return;
        }
      }
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
              'Your Controller Account’s balance is running now. Top up now to ensure rewards are paid out in time.',
            title: 'Low Controller Account Balance',
            createdAt: Date.now(),
            canBeDismissed: false,
            dismissTime: 1000 * 60 * 60 * 24,
            dismissTo: undefined,
            type: '',
            buttonProps: {
              label: 'Add Balance',
              navigateHref: '',
            },
          });
          notificationStore.sortNotificationList();
        }
      }
    },
    [account, notificationStore.notificationList, provider],
  );

  const makeUnlockWithdrawalNotification = useCallback(
    async (mode?: 'reload') => {
      if (!contracts) return;
      if (mode !== 'reload') {
        if (notificationStore.notificationList.find((item) => item.key === NotificationKey.UnlockWithdrawal)) {
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
          message: '',
          title: 'Unlocked Withdrawals Available',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: 1000 * 60 * 60 * 24,
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

  const initAllNotification = useCallback(() => {
    idleCallback(() => makeOverAllocateAndUnStakeAllocationNotification());
    idleCallback(() => makeUnClaimedNotification());
    idleCallback(() => makeLowBillingBalanceNotification());
    idleCallback(() => makeInactiveOperatorNotification());
    idleCallback(() => makeLowControllerBalanceNotification());
    idleCallback(() => makeUnlockWithdrawalNotification());
    idleCallback(() => makeOutdateAllocationProjects());
  }, [
    makeOverAllocateAndUnStakeAllocationNotification,
    makeUnClaimedNotification,
    makeLowBillingBalanceNotification,
    makeInactiveOperatorNotification,
    makeLowControllerBalanceNotification,
    makeUnlockWithdrawalNotification,
    makeOutdateAllocationProjects,
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
      notificationStore.removeNotification(NotificationKey.OutdatedAllocation);
      idleCallback(() => makeOutdateAllocationProjects('reload'));
    },
    initNewNotification: () => idleCallback(initAllNotification),
  };
};
