// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContainer, Logger } from './Container';

type InitialState = {
  contractAddress: string;
};

type QueryDetails = {
  id: string;
  metadata: string; // IPFS Cid
  deployment: string; // IPFS Cid
};

function useQueryRegistryImpl(logger: Logger, initialState?: InitialState) {
  const registerQuery = async (metadataCid: string): Promise<string> => {
    // Call contract function to register a new project, should emit an event with an id
    throw new Error('Not implemented');
  };

  const updateMetadata = async (metadataCid: string) => {
    // Sets the metadata IPFS cid for a Project Metadata object
    throw new Error('Not implemented');
  };

  const releaseVersion = async (deploymentCid: string) => {
    // Deployment CID comes from the cli publish command
    throw new Error('Not implemented');
  };

  const getQuery = async (id: string): Promise<QueryDetails> => {
    // Just for testing purposes
    return {
      id,
      metadata: 'QmbDYfuaQAptXNkAcJA8EfFrYauG8BoYWwUZRwE9Eg3Zif',
      deployment: 'QmZf1wBc26x9jCuxWmzpMtqX799DqQnvGuT16Xu7JtAHo2',
    };

    throw new Error('Not implemented');
  };

  return {
    registerQuery,
    updateMetadata,
    releaseVersion,
    getQuery,
  };
}

export const { useContainer: useQueryRegistry, Provider: QueryRegistryProvider } = createContainer(
  useQueryRegistryImpl,
  { displayName: 'QueryRegistry' },
);
