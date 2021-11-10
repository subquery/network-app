// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3, Web3Provider } from './Web3';
import { useIPFS, IPFSProvider } from './IPFS';
import { useProjectMetadata, ProjectMetadataProvider } from './ProjectMetatada';
import { useQueryRegistry, QueryRegistryProvider } from './QueryRegistry';
import { useContracts, ContractsProvider } from './Contracts';
import {
  useProjectsQuery,
  useDeploymentsQuery,
  useIndexersQuery,
  QueryRegistryProjectProvider,
} from './QueryRegistryProject';

export {
  useIPFS,
  useWeb3,
  useProjectMetadata,
  useQueryRegistry,
  useProjectsQuery,
  useDeploymentsQuery,
  useIndexersQuery,
  useContracts,
  IPFSProvider,
  Web3Provider,
  ProjectMetadataProvider,
  QueryRegistryProvider,
  ContractsProvider,
  QueryRegistryProjectProvider,
};
