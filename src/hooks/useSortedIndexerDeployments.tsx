// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useIndexerDeploymentsQuery } from '../containers/QueryRegistryProject';
import { AsyncData, mapAsync, notEmpty } from '../utils';

interface UseSortedIndexerDeploymentsReturn {
  id: string;
  deploymentId?: string;
  projectId?: string;
  projectMeta?: string;
  status: string;
}

export function useSortedIndexerDeployments(indexer: string): AsyncData<Array<UseSortedIndexerDeploymentsReturn>> {
  const indexerDeployments = useIndexerDeploymentsQuery({ indexerAddress: indexer });

  return mapAsync(
    (data) =>
      data.deploymentIndexers?.nodes.filter(notEmpty).map((deploymentIndexer) => {
        const { id, status, deployment } = deploymentIndexer;
        let projectId, projectMeta, deploymentId;
        if (deployment) {
          const { id, project } = deployment;
          deploymentId = id;
          projectId = project?.id;
          projectMeta = project?.metadata;
        }
        return { id, status, deploymentId, projectId, projectMeta };
      }),
    indexerDeployments,
  );
}
