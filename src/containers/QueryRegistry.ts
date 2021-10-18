// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, BigNumberish, ContractTransaction } from 'ethers';
import { createContainer, Logger } from './Container';
import { useContracts } from './Contracts';

type InitialState = {
  contractAddress: string;
};

type QueryDetails = {
  queryId: BigNumber;
  owner: string;
  metadata: string; // IPFS Cid
  deployment: string; // IPFS Cid
  version: string; // IPFS Cid
};

function useQueryRegistryImpl(logger: Logger, initialState?: InitialState) {
  const contracts = useContracts();

  const registerQuery = async (metadataCid: string): Promise<ContractTransaction> => {
    // Call contract function to register a new project, should emit an event with an id
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    return contracts?.queryRegistry.createQueryProject(metadataCid);
  };

  const updateMetadata = async (metadataCid: string) => {
    // Sets the metadata IPFS cid for a Project Metadata object
    throw new Error('Not implemented');
  };

  const releaseVersion = async (deploymentCid: string) => {
    // Deployment CID comes from the cli publish command
    throw new Error('Not implemented');
  };

  const getQuery = async (id: BigNumberish): Promise<QueryDetails> => {
    // Just for testing purposes
    // return {
    //   queryId: BigNumber.from(id),
    //   metadata: 'QmbDYfuaQAptXNkAcJA8EfFrYauG8BoYWwUZRwE9Eg3Zif',
    //   deployment: 'QmZf1wBc26x9jCuxWmzpMtqX799DqQnvGuT16Xu7JtAHo2',
    //   version: '',
    //   owner: 'asdf'
    // };

    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    const result = await contracts.queryRegistry.queryInfos(id);

    return {
      queryId: result.queryId,
      owner: result.owner,
      metadata: result.metadata,
      deployment: result.latestDeploymentId,
      version: result.latestVersion,
    };
  };

  const getUserQueries = async (address: string): Promise<BigNumber[]> => {
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    const count = await contracts.queryRegistry.queryInfoCountByOwner(address);

    return Promise.all(
      Array.from(new Array(count).keys()).map((_, index) =>
        contracts.queryRegistry.queryInfoIdsByOwner(address, index),
      ),
    );
  };

  return {
    registerQuery,
    updateMetadata,
    releaseVersion,
    getQuery,
    getUserQueries,
  };
}

export const { useContainer: useQueryRegistry, Provider: QueryRegistryProvider } = createContainer(
  useQueryRegistryImpl,
  { displayName: 'QueryRegistry' },
);
