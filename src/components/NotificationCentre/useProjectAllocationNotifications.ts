import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useAccount } from '@containers/Web3';
import BigNumberJs from 'bignumber.js';

import { NotificationKey } from 'src/stores/notification';

import { useNotificationBase } from './useNotificationBase';

export const useProjectAllocationNotifications = () => {
  const { notificationStore, checkIfExistAndExpired, defaultDismissTime } = useNotificationBase();
  const { account } = useAccount();

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
        sum?: { totalAmount?: string };
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

  const makeOutdateAllocationProjects = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired([
          NotificationKey.OutdatedAllocationV2,
          NotificationKey.MislaborAllocation,
        ]);
        if (exist && !expired) return;
      }

      const res = await fetchAllocationProjects({
        variables: { id: account || '' },
      });

      // Handle outdated allocations
      const { exist: outdatedExist, expired: outdatedExpired } = checkIfExistAndExpired([
        NotificationKey.OutdatedAllocationV2,
      ]);

      if (mode === 'reload' || !outdatedExist || outdatedExpired) {
        const newVersionOfProject = res.data?.indexerAllocationSummaries?.nodes
          .filter((node) => node?.deploymentId !== node?.project?.deploymentId)
          .map((i) => [i?.deploymentId, i?.project?.deploymentId]);

        if (!newVersionOfProject?.length) return;

        const boosterRes = await fetchBooster({
          variables: { deploymentIds: newVersionOfProject.flat() },
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

          return currentBooster.gt(previousBooster);
        });

        if (outdatedDeployment?.length) {
          notificationStore.addNotification({
            key: NotificationKey.OutdatedAllocationV2,
            level: 'critical',
            message: `You have allocated to an outdated deployment. Please adjust your allocation to the latest version.\nOutdated deployment id: ${outdatedDeployment.map((i) => i[0]).join('\n')}`,
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

      // Handle mislabor allocations
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
    [
      account,
      checkIfExistAndExpired,
      defaultDismissTime,
      fetchAllocationProjects,
      fetchBooster,
      fetchTerminatedProjects,
      notificationStore,
    ],
  );

  return {
    makeOutdateAllocationProjects,
  };
};
