// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useProjectMetadata } from '../containers';
import { useIndexerDeploymentsQuery } from '../containers/QueryRegistryProject';
import { ProjectMetadata } from '../models';
import { AsyncData, cidToBytes32, getDeploymentProgress } from '../utils';
import { Status } from '@subql/network-query';
import { DeploymentIndexerNodeFieldsFragment as DeploymentIndexer } from '@subql/network-query';
//import { GetDeploymentIndexersByIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../__generated__/registry/GetDeploymentIndexersByIndexer';
import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerMetadata } from './useIndexerMetadata';
import { useWeb3Store } from 'src/stores';
import { useGetDeploymentIndexerQuery } from '@subql/react-hooks';

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
  const { contracts } = useWeb3Store();
  const indexerDeployments = useIndexerDeploymentsQuery({ indexerAddress: indexer });
  const indexerMetadata = useIndexerMetadata(indexer);
  const proxyEndpoint = indexerMetadata?.data?.url;

  const sortedIndexerDeployments = useAsyncMemo(async () => {
    if (!indexerDeployments?.data?.deploymentIndexers?.nodes) return [];

    const filteredDeployments = indexerDeployments?.data?.deploymentIndexers?.nodes?.filter(
      (deployment) => deployment?.status !== Status.TERMINATED,
    );
    return await Promise.all(
      filteredDeployments.map(async (indexerDeployment) => {
        const metadata: ProjectMetadata = indexerDeployment?.deployment?.project
          ? await getMetadataFromCid(indexerDeployment.deployment.project.metadata)
          : { name: '', image: '', description: '', websiteUrl: '', codeUrl: '' };

        const deploymentId = indexerDeployment?.deployment?.id;
        const isOffline = deploymentId
          ? await contracts?.queryRegistry.isOffline(cidToBytes32(deploymentId), indexer)
          : false;
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
