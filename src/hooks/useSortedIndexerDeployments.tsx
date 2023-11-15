// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { IndexerDeploymentNodeFieldsFragment as DeploymentIndexer, ServiceStatus } from '@subql/network-query';
import { useGetDeploymentIndexersByIndexerQuery } from '@subql/react-hooks';

import { useProjectMetadata } from '../containers';
import { ProjectMetadata } from '../models';
import { AsyncData, getDeploymentProgress } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerMetadata } from './useIndexerMetadata';

const fetchDeploymentProgress = async (
  indexer: string,
  proxyEndpoint: string | undefined,
  deploymentId: string | undefined,
) => {
  const indexingProgressErr = 'Failed to fetch deployment progress. Please check the proxyEndpoint.';
  if (proxyEndpoint && deploymentId) {
    try {
      const indexingProgress = await getDeploymentProgress({
        proxyEndpoint,
        deploymentId,
        indexer,
      });
      return { indexingProgress };
    } catch (error) {
      return { indexingProgressErr };
    }
  }

  return { indexingProgressErr };
};

export interface UseSortedIndexerDeploymentsReturn extends Partial<DeploymentIndexer> {
  indexingProgress?: number | undefined;
  indexingProgressErr?: string;
  deploymentId?: string;
  projectId?: string;
  projectName?: string;
  projectMeta: ProjectMetadata;
  isOffline?: boolean | undefined;
}

// TODO: apply with query hook
export function useSortedIndexerDeployments(indexer: string): AsyncData<Array<UseSortedIndexerDeploymentsReturn>> {
  const { getMetadataFromCid } = useProjectMetadata();
  const indexerDeployments = useGetDeploymentIndexersByIndexerQuery({ variables: { indexerAddress: indexer } });
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
          : { name: '', image: '', description: '', websiteUrl: '', codeUrl: '', type: 'SUBQUERY' };

        const deploymentId = indexerDeployment?.deployment?.id;
        // TODO: get `offline` status from external api call
        const isOffline = false;
        const { indexingProgress, indexingProgressErr } = await fetchDeploymentProgress(
          indexer,
          proxyEndpoint,
          deploymentId,
        );

        return {
          ...indexerDeployment,
          indexingProgress,
          indexingProgressErr,
          isOffline,
          deploymentId,
          projectId: indexerDeployment?.deployment?.project?.id,
          projectName: metadata.name ?? indexerDeployment?.deployment?.project?.id,
          projectMeta: {
            ...metadata,
          },
        };
      }),
    );
  }, [indexerDeployments.loading, proxyEndpoint]);

  return sortedIndexerDeployments;
}
