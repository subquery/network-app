import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { TOP_100_INDEXERS } from '@containers';
import { useAccount } from '@containers/Web3';
import { useEra } from '@hooks';
import { useGetRewardsLazyQuery } from '@subql/react-hooks';
import { numToHex } from '@utils';

import { NotificationKey } from 'src/stores/notification';

import { CanRenderOnNotification } from '../NotificationCentre';
import { useNotificationBase } from './useNotificationBase';

export const useGeneralNotifications = () => {
  const { notificationStore, checkIfExistAndExpired, defaultDismissTime } = useNotificationBase();
  const { currentEra } = useEra();
  const { account } = useAccount();
  const [fetchRewardsApi] = useGetRewardsLazyQuery();

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
    { context: { clientName: TOP_100_INDEXERS } },
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

  const makeUnClaimedNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.UnclaimedRewards);
        if (exist && !expired) return;
      }

      const res = await fetchRewardsApi({
        variables: { address: account || '' },
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
    [account, checkIfExistAndExpired, defaultDismissTime, fetchRewardsApi, notificationStore],
  );

  const makeUnhealthyAllocationNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.UnhealthyAllocation);
        if (exist && !expired) return;
      }

      const res = await fetchUnhealthyAllocation({
        variables: { indexer: account || '' },
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
    [account, checkIfExistAndExpired, fetchUnhealthyAllocation, notificationStore],
  );

  const makeNewOperatorNotification = useCallback(async () => {
    const res = await fetchPreviousEra({
      variables: { eraId: numToHex((currentEra.data?.index || 0) - 1) },
    });

    if (res.data?.eras.nodes[0]) {
      const { createdBlock } = res.data.eras.nodes[0];
      const newOperators = await fetchNewOperators({
        variables: { block: createdBlock },
      });

      const count = newOperators.data?.indexers.nodes.length;
      if (count) {
        notificationStore.addNotification(
          {
            key: NotificationKey.NewOperator,
            level: 'info',
            message: `${count} new Node Operators ${count > 1 ? 'have' : 'has'} joined the SubQuery Network.\n\n${newOperators.data?.indexers.nodes
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
  }, [currentEra.data?.index, defaultDismissTime, fetchNewOperators, fetchPreviousEra, notificationStore]);

  const makeConsumerRewardsProgrameNotification = useCallback(async () => {
    notificationStore.addNotification(
      {
        key: NotificationKey.ConsumerRewards,
        level: 'info',
        message: `We've allocated 1 Million $SQT rewards pool for consumers who host their indexers or use dRPCs on the SubQuery Network. Earn up to 900% of your query spending.`,
        title: 'Consumer Rewards Pool Increase',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: defaultDismissTime,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'Learn More',
          navigateHref: 'https://subquery.foundation/consumer-rewards',
        },
      },
      true,
    );
  }, [defaultDismissTime, notificationStore]);

  return {
    makeUnClaimedNotification,
    makeUnhealthyAllocationNotification,
    makeNewOperatorNotification,
    makeConsumerRewardsProgrameNotification,
  };
};
