import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { useSQToken } from '@containers';
import { useAccount } from '@containers/Web3';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { formatSQT } from '@subql/react-hooks';
import BigNumberJs from 'bignumber.js';
import { uniqBy } from 'lodash-es';

import { NotificationKey } from 'src/stores/notification';

import { useNotificationBase } from './useNotificationBase';
import { CanRenderOnNotification } from '.';

export const useConsumerNotifications = () => {
  const { notificationStore, checkIfExistAndExpired, defaultDismissTime } = useNotificationBase();
  const { account } = useAccount();
  const { consumerHostBalance } = useSQToken();
  const { getHostingPlanApi } = useConsumerHostServices({ autoLogin: false });
  const [fetchOwnerProjects] = useLazyQuery<{
    projects: { nodes: { deploymentId: string }[] };
  }>(gql`
    {
      projects(first: 10, filter: { owner: { equalTo: "${account}" } }, orderBy: CREATED_BLOCK_DESC) {
        nodes {
          deploymentId
          
        }
      }
    }
  `);

  const [fetchZeroBoosterProjects] = useLazyQuery<{
    deploymentBoosterSummaries: { nodes: { deploymentId: string; projectId: string; project: { metadata: string } }[] };
  }>(gql`
    query MyBooster($deployments: [String!]) {
      deploymentBoosterSummaries(filter: { deploymentId: { in: $deployments }, totalAmount: { equalTo: "0" } }) {
        nodes {
          projectId
          deploymentId
          project {
            metadata
          }
        }
      }
    }
  `);

  const makeUnhealthyConsumerRewardsProjectNotification = useCallback(async () => {
    const res = await fetch(`${import.meta.env.VITE_CONSUMER_CAMPAIGN_URL}/compaign/unhealth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owners: [account] }),
    });

    const json: { code: 0; data: { reason: string; projectId: string; metadataName: string }[] } = await res.json();

    if (json.code === 0) {
      const unhealthyProjects = uniqBy(json.data, 'projectId');
      if (unhealthyProjects.length) {
        notificationStore.addNotification({
          key: NotificationKey.UnhealthyConsumerRewards,
          level: 'critical',
          message: `Your project ${unhealthyProjects.map((i) => i.metadataName || i.projectId).join(',')} is not currently eligible for the Consumer Rewards Programme and must first be verified.\n\nReach out to us at hello@subquery.network to become verified.`,
          title: 'Verify your project to join Consumer Rewards Programme',
          createdAt: Date.now(),
          canBeDismissed: true,
          dismissTime: defaultDismissTime,
          dismissTo: undefined,
          type: '',
          buttonProps: {
            label: 'View Project',
            navigateHref: `/projects/project/${unhealthyProjects[0].projectId}`,
          },
        });
      } else {
        notificationStore.removeNotification(NotificationKey.UnhealthyConsumerRewards);
      }
    }
  }, [account, defaultDismissTime, notificationStore]);

  const makeLowBillingBalanceNotification = useCallback(
    async (mode?: 'reload') => {
      if (mode !== 'reload') {
        const { exist, expired } = checkIfExistAndExpired(NotificationKey.LowBillingBalance);
        if (exist && !expired) return;
      }

      const hostingPlan = await getHostingPlanApi({ account: account || '' });
      if (!hostingPlan?.data?.length) return;

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
    [account, checkIfExistAndExpired, consumerHostBalance, defaultDismissTime, getHostingPlanApi, notificationStore],
  );

  const makeNoBoosterNotification = useCallback(async () => {
    const res = await fetchOwnerProjects();
    const allDeployments = res.data?.projects.nodes.map((i) => i.deploymentId) || [];
    if (!allDeployments.length) return;

    const boosterRes = await fetchZeroBoosterProjects({ variables: { deployments: allDeployments } });
    const noBoosterProjects = boosterRes.data?.deploymentBoosterSummaries.nodes || [];
    if (noBoosterProjects.length) {
      notificationStore.addNotification({
        key: NotificationKey.NoBoosterOnDeployment,
        level: 'critical',
        message: `You have ${noBoosterProjects.length} project(s) without boosters. Adding boosters can attract more operators to run your projects and help reduce your overall costs.\n\n${noBoosterProjects
          .map(
            (i) =>
              `{{ {"componentKey": "${CanRenderOnNotification.DeploymentInfo}", "componentProps": { "deploymentId": "${i.deploymentId}", "projectMetadata": "${i.project.metadata}" } } }}`,
          )
          .join('\n')}`,
        title: 'Consider adding boosters to your projects',
        createdAt: Date.now(),
        canBeDismissed: true,
        dismissTime: defaultDismissTime,
        dismissTo: undefined,
        type: '',
        buttonProps: {
          label: 'View Projects',
          navigateHref: '/projects',
        },
      });
    } else {
      notificationStore.removeNotification(NotificationKey.NoBoosterOnDeployment);
    }
  }, [account, fetchOwnerProjects, notificationStore, defaultDismissTime]);

  return {
    makeUnhealthyConsumerRewardsProjectNotification,
    makeLowBillingBalanceNotification,
    makeNoBoosterNotification,
  };
};
