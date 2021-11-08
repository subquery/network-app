// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, BigNumberish, ContractTransaction, constants } from 'ethers';
import { createContainer, Logger } from './Container';
import { useContracts } from './Contracts';
import * as React from 'react';
import { bytes32ToCid, cidToBytes32 } from '../utils';

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

  const registerQuery = async (
    metadataCid: string,
    deploymentId: string,
    versionCid: string,
  ): Promise<ContractTransaction> => {
    // Call contract function to register a new project, should emit an event with an id
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    return contracts?.queryRegistry.createQueryProject(
      cidToBytes32(metadataCid),
      cidToBytes32(versionCid),
      cidToBytes32(deploymentId),
    );
  };

  const updateQueryMetadata = (id: BigNumberish, metadata: string) => {
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    return contracts.queryRegistry.updateQueryProjectMetadata(id, cidToBytes32(metadata));
  };

  const updateDeployment = (id: BigNumberish, deploymentId: string, version: string) => {
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    return contracts.queryRegistry.updateDeployment(id, cidToBytes32(deploymentId), cidToBytes32(version));
  };

  const getQuery = async (id: BigNumberish): Promise<QueryDetails | undefined> => {
    // Just for testing purposes
    // return {
    //   queryId: BigNumber.from(id),
    //   metadata: 'QmbDYfuaQAptXNkAcJA8EfFrYauG8BoYWwUZRwE9Eg3Zif',
    //   deployment: 'QmZf1wBc26x9jCuxWmzpMtqX799DqQnvGuT16Xu7JtAHo2',
    //   version: '',
    //   owner: 'asdf'
    // };

    if (!contracts) {
      logger.w('contracts not available');
      return undefined;
    }

    const result = await contracts.queryRegistry.queryInfos(id);

    return {
      queryId: result.queryId,
      owner: result.owner,
      metadata: bytes32ToCid(result.metadata),
      deployment: bytes32ToCid(result.latestDeploymentId),
      version: bytes32ToCid(result.latestVersion),
    };
  };

  const getUserQueries = React.useCallback(
    async (address: string): Promise<BigNumber[]> => {
      if (!contracts) {
        // throw new Error('QueryRegistry contract not available');
        return [];
      }

      const count = await contracts.queryRegistry.queryInfoCountByOwner(address);

      return Promise.all(
        Array.from(new Array(count.toNumber()).keys()).map((_, index) =>
          contracts.queryRegistry.queryInfoIdsByOwner(address, index),
        ),
      );
    },
    [contracts],
  );

  return {
    registerQuery,
    getQuery,
    getUserQueries,
    updateQueryMetadata,
    updateDeployment,
  };
}

export const { useContainer: useQueryRegistry, Provider: QueryRegistryProvider } = createContainer(
  useQueryRegistryImpl,
  { displayName: 'QueryRegistry' },
);
