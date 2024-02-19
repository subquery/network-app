// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { indexingProgress } from '@subql/network-clients';
import { IndexerDeploymentNodeFieldsFragment as DeploymentIndexer, ServiceStatus } from '@subql/network-query';
import {
  useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery,
  useGetDeploymentIndexersByIndexerQuery,
  useGetIndexerAllocationProjectsQuery,
} from '@subql/react-hooks';

import { useProjectMetadata } from '../containers';
import { ProjectMetadata } from '../models';
import { AsyncData, getDeploymentMetadata } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerMetadata } from './useIndexerMetadata';

export interface UseSortedIndexerDeploymentsReturn extends Partial<DeploymentIndexer> {
  indexingErr?: string;
  deploymentId?: string;
  projectId?: string;
  projectName?: string;
  projectMeta: ProjectMetadata;
  isOffline?: boolean | undefined;
  lastHeight: number;
  indexingProgress: number;
  allocatedAmount?: string;
  allocatedTotalRewards?: string;
}

// TODO: apply with query hook
export function useSortedIndexerDeployments(indexer: string): AsyncData<Array<UseSortedIndexerDeploymentsReturn>> {
  const { getMetadataFromCid } = useProjectMetadata();
  const indexerDeployments = useGetDeploymentIndexersByIndexerQuery({
    variables: { indexerAddress: indexer },
    fetchPolicy: 'network-only',
  });
  const allocatedProjects = useGetIndexerAllocationProjectsQuery({
    variables: {
      id: indexer || '',
    },
    fetchPolicy: 'network-only',
  });
  const allocatedRewards = useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery({
    variables: {
      indexerId: indexer || '',
    },
    fetchPolicy: 'network-only',
  });

  const { indexerMetadata } = useIndexerMetadata(indexer);
  const proxyEndpoint = indexerMetadata?.url;

  const sortedIndexerDeployments = useAsyncMemo(async () => {
    if (!indexerDeployments?.data?.indexerDeployments?.nodes) return [];

    const filteredDeployments = indexerDeployments?.data?.indexerDeployments?.nodes?.filter(
      (deployment) => deployment?.status !== ServiceStatus.TERMINATED,
    );
    return await Promise.all(
      filteredDeployments.map(async (indexerDeployment) => {
        const metadata: ProjectMetadata = indexerDeployment?.deployment?.project
          ? await getMetadataFromCid(indexerDeployment.deployment.project.metadata)
          : {
              name: '',
              image: '',
              description: '',
              websiteUrl: '',
              codeUrl: '',
              versionDescription: '',
              categories: [],
            };

        const deploymentId = indexerDeployment?.deployment?.id;
        // TODO: get `offline` status from external api call
        const isOffline = false;
        let indexingErr = '';
        let sortedIndexingProcess = 0;
        let lastHeight = 0;
        try {
          const res = await getDeploymentMetadata({
            indexer,
            proxyEndpoint,
            deploymentId,
          });
          lastHeight = res?.lastHeight || 0;
          sortedIndexingProcess = indexingProgress({
            currentHeight: res?.lastHeight || 0,
            startHeight: res?.startHeight || 0,
            targetHeight: res?.targetHeight || 0,
          });
        } catch (e) {
          indexingErr = "Failed to fetch metadata from deployment's Query Service.";
        }

        const allocatedAmount = allocatedProjects.data?.indexerAllocationSummaries?.nodes
          .find((i) => i?.deploymentId === deploymentId)
          ?.totalAmount.toString();
        const allocatedTotalRewards = allocatedRewards.data?.indexerAllocationRewards?.groupedAggregates
          ?.find((i) => {
            return i?.keys?.[0] === deploymentId;
          })
          ?.sum?.reward.toString();

        return {
          ...indexerDeployment,
          indexingErr,
          indexingProgress: sortedIndexingProcess,
          lastHeight,
          isOffline,
          deploymentId,
          projectId: indexerDeployment?.deployment?.project?.id,
          projectName: metadata.name ?? indexerDeployment?.deployment?.project?.id,
          projectMeta: {
            ...metadata,
          },
          allocatedAmount,
          allocatedTotalRewards,
        };
      }),
    );
  }, [indexerDeployments.loading, proxyEndpoint, allocatedProjects.data, allocatedRewards.data]);

  return {
    ...sortedIndexerDeployments,
    refetch: async () => {
      await indexerDeployments.refetch();
      await allocatedProjects.refetch();
      await allocatedRewards.refetch();
    },
  };
}
