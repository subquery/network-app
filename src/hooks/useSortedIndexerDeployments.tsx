// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useIndexerDeploymentsQuery } from '../containers/QueryRegistryProject';
import { AsyncData, mapAsync, notEmpty } from '../utils';
import { GetDeploymentIndexersByIndexer_deploymentIndexers_nodes as DeploymentIndexer } from '../__generated__/GetDeploymentIndexersByIndexer';

export function useSortedIndexerDeployments(indexer: string): AsyncData<Array<DeploymentIndexer>> {
  const indexerDeployments = useIndexerDeploymentsQuery({ indexerAddress: indexer });

  return mapAsync((data) => data.deploymentIndexers?.nodes.filter(notEmpty), indexerDeployments);
}
