import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { parseRawEraValue } from '@hooks/useEraValue';
import { useGetFilteredDelegationsLazyQuery } from '@subql/react-hooks';
import { convertBigNumberToNumber } from '@utils';
import { limitContract, makeCacheKey } from '@utils/limitation';
import dayjs from 'dayjs';

import { useWeb3Store } from 'src/stores';
import { NotificationKey } from 'src/stores/notification';

import { useNotificationBase } from './useNotificationBase';

export const useDelegatorNotifications = () => {
  const { notificationStore, checkIfExistAndExpired, defaultDismissTime } = useNotificationBase();
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const { account } = useAccount();
  const [fetchDelegations] = useGetFilteredDelegationsLazyQuery();
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

  const makeInactiveOperatorNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.InactiveOperator);
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
    [account, checkIfExistAndExpired, currentEra.data?.index, defaultDismissTime, fetchDelegations, notificationStore],
  );

  const makeUnlockWithdrawalNotification = useCallback(
    async (mode?: 'reload') => {
      if (!contracts) return;
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.UnlockWithdrawal);
        if (exist && !expired) return;
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
    [account, checkIfExistAndExpired, contracts, defaultDismissTime, fetchUnlockWithdrawal, notificationStore],
  );

  const makeInOrDecreaseCommissionNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired([
          NotificationKey.DecreaseCommissionRate,
          NotificationKey.IncreaseCommissionRate,
        ]);
        if (exist && !expired) return;
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

        // Handle decrease commission notification
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

        // Handle increase commission notification
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
    [account, checkIfExistAndExpired, currentEra.data?.index, defaultDismissTime, fetchDelegations, notificationStore],
  );

  return {
    makeInactiveOperatorNotification,
    makeUnlockWithdrawalNotification,
    makeInOrDecreaseCommissionNotification,
  };
};
