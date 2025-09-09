import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { l2Chain, useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { useEthersProviderWithPublic } from '@hooks/useEthersProvider';
import { getTotalStake } from '@hooks/useSortedIndexer';
import { formatEther, formatSQT, useGetIndexerLazyQuery } from '@subql/react-hooks';
import { convertBigNumberToNumber, numToHex } from '@utils';
import { limitContract, makeCacheKey } from '@utils/limitation';
import BigNumberJs from 'bignumber.js';

import { useWeb3Store } from 'src/stores';
import { NotificationKey } from 'src/stores/notification';

import { useNotificationBase } from './useNotificationBase';

export const useIndexerNotifications = () => {
  const { notificationStore, checkIfExistAndExpired, defaultDismissTime } = useNotificationBase();
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const { account } = useAccount();
  const [fetchIndexerData] = useGetIndexerLazyQuery();
  const [fetchIndexerController] = useLazyQuery<{ indexer?: { controller?: string } }>(gql`
    query Indexer($address: String!) {
      indexer(id: $address) {
        controller
      }
    }
  `);

  const makeOverAllocateAndUnStakeAllocationNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired([
          NotificationKey.OverAllocate,
          NotificationKey.OverAllocateNextEra,
          NotificationKey.UnstakeAllocation,
        ]);
        if (exist && !expired) return;
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

      // Handle unstake allocation notification
      const { exist: unstakeExist, expired: unstakeExpire } = checkIfExistAndExpired(NotificationKey.UnstakeAllocation);
      if (isUnused && (mode === 'reload' || !unstakeExist || unstakeExpire)) {
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

      // Handle over allocate notification
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

      // Handle next era over allocation
      const indexerData = await fetchIndexerData({
        variables: { address: account || '' },
        fetchPolicy: 'network-only',
      });

      if (indexerData.data?.indexer?.id) {
        const totalStake = getTotalStake(indexerData.data.indexer.totalStake, currentEra.data?.index);

        if (totalStake.after && BigNumberJs(totalStake.after).lt(runnerAllocation.used)) {
          notificationStore.addNotification({
            key: NotificationKey.OverAllocateNextEra,
            level: 'info',
            message: `Your stake is over allocated for the next era and risk having your rewards burned.\n\nRemove Allocation from your projects to restore rewards`,
            title: 'Stake Over Allocated Next Era',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: 1000,
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
      }
    },
    [
      account,
      contracts,
      checkIfExistAndExpired,
      currentEra.data?.index,
      defaultDismissTime,
      fetchIndexerData,
      notificationStore,
    ],
  );

  const makeLowControllerBalanceNotification = useCallback(
    async (mode?: 'reload') => {
      const res = await fetchIndexerController({
        variables: { address: account || '' },
        fetchPolicy: 'network-only',
      });

      if (res.data?.indexer?.controller) {
        const controller = res.data.indexer.controller;
        const provider = useEthersProviderWithPublic({ chainId: l2Chain.id });
        const controllerBalance = await provider?.getBalance(controller);

        if (BigNumberJs(formatEther(controllerBalance)).lt(0.001)) {
          notificationStore.addNotification({
            key: NotificationKey.LowControllerBalance,
            level: 'critical',
            message: `Your Controller Account's balance is running low. Top up now to ensure rewards are paid out in time.`,
            title: 'Low Controller Account Balance',
            createdAt: Date.now(),
            canBeDismissed: true,
            dismissTime: defaultDismissTime,
            dismissTo: undefined,
            type: '',
            buttonProps: { label: '', navigateHref: '' },
          });
        } else {
          notificationStore.removeNotification(NotificationKey.LowControllerBalance);
        }
      }
    },
    [account, defaultDismissTime, fetchIndexerController, notificationStore],
  );

  return {
    makeOverAllocateAndUnStakeAllocationNotification,
    makeLowControllerBalanceNotification,
  };
};
