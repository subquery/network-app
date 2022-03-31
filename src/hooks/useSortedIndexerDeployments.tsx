// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useProjectMetadata } from '../containers';
import { useIndexerDeploymentsQuery } from '../containers/QueryRegistryProject';
import { ProjectMetadata } from '../models';
import { AsyncData, getDeploymentProgress } from '../utils';
import { GetDeploymentIndexersByIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../__generated__/GetDeploymentIndexersByIndexer';
import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerMetadata } from './useIndexerMetadata';

interface UseSortedIndexerDeploymentsReturn {
  indexingProgress?: number | '' | undefined;
  deploymentId?: string;
  projectId?: string;
  projectName?: string;
  projectMeta: ProjectMetadata;
}

export function useSortedIndexerDeployments(
  indexer: string,
): AsyncData<Array<UseSortedIndexerDeploymentsReturn & Partial<DeploymentIndexer>>> {
  const { getMetadataFromCid } = useProjectMetadata();
  const indexerDeployments = useIndexerDeploymentsQuery({ indexerAddress: indexer });
  const indexerMetadata = useIndexerMetadata(indexer);
  const proxyEndpoint = indexerMetadata?.data?.url;

  const sortedIndexerDeployments = useAsyncMemo(async () => {
    if (!indexerDeployments?.data?.deploymentIndexers?.nodes) return [];
    return await Promise.all(
      indexerDeployments.data.deploymentIndexers?.nodes.map(async (indexerDeployment) => {
        const metadata: ProjectMetadata = indexerDeployment?.deployment?.project
          ? await getMetadataFromCid(indexerDeployment.deployment.project.metadata)
          : { name: '', image: '', description: '', websiteUrl: '', codeUrl: '' };

        const deploymentId = indexerDeployment?.deployment?.id;
        const indexingProgress =
          proxyEndpoint &&
          deploymentId &&
          (await getDeploymentProgress({
            proxyEndpoint,
            deploymentId,
            indexer,
          }));

        return {
          ...indexerDeployment,
          indexingProgress,
          deploymentId,
          projectId: indexerDeployment?.deployment?.project?.id,
          projectName: metadata.name ?? indexerDeployment?.deployment?.project?.id,
          projectMeta: {
            ...metadata,
          },
        };
      }),
    );
  }, [indexerDeployments.loading]);

  // console.log('sortedIndexerDeployments', sortedIndexerDeployments);
  return sortedIndexerDeployments;
  // return sortedIndexerDeployments;
  // return mapAsync((data) => data.deploymentIndexers?.nodes.filter(notEmpty), indexerDeployments);
}
