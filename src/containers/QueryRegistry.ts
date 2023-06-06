// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BigNumber, BigNumberish, ContractTransaction } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { bytes32ToCid, cidToBytes32 } from '../utils';
import { createContainer, Logger } from './Container';

type QueryDetails = {
  queryId: BigNumber;
  owner: string;
  metadata: string; // IPFS Cid
  deployment: string; // IPFS Cid
  version: string; // IPFS Cid
};

function useQueryRegistryImpl(logger: Logger) {
  const { contracts } = useWeb3Store();

  const projectCache = React.useRef<Record<string, QueryDetails>>({});

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

  const updateQueryMetadata = async (id: BigNumberish, metadata: string): Promise<ContractTransaction> => {
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    const tx = await contracts.queryRegistry.updateQueryProjectMetadata(id, cidToBytes32(metadata));

    tx.wait().then((receipt) => {
      if (!receipt.status) {
        return;
      }

      projectCache.current[BigNumber.from(id).toString()] = {
        ...projectCache.current[BigNumber.from(id).toString()],
        metadata,
      };
    });

    return tx;
  };

  const updateDeployment = async (
    id: BigNumberish,
    deploymentId: string,
    version: string,
  ): Promise<ContractTransaction> => {
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

    const tx = await contracts.queryRegistry.updateDeployment(id, cidToBytes32(deploymentId), cidToBytes32(version));

    tx.wait().then((receipt) => {
      if (!receipt.status) {
        return;
      }

      projectCache.current[BigNumber.from(id).toString()] = {
        ...projectCache.current[BigNumber.from(id).toString()],
        deployment: deploymentId,
        version,
      };
    });

    return tx;
  };

  const getQuery = async (id: BigNumberish): Promise<QueryDetails | undefined> => {
    if (!contracts) {
      logger.w('contracts not available');
      return undefined;
    }

    if (!projectCache.current[BigNumber.from(id).toString()]) {
      const result = await contracts.queryRegistry.queryInfos(id);

      projectCache.current[BigNumber.from(id).toString()] = {
        queryId: result.queryId,
        owner: result.owner,
        metadata: bytes32ToCid(result.metadata),
        deployment: bytes32ToCid(result.latestDeploymentId),
        version: bytes32ToCid(result.latestVersion),
      };
    }

    return projectCache.current[BigNumber.from(id).toString()];
  };

  // const getUserQueries = React.useCallback(
  //   async (address: string): Promise<BigNumber[]> => {
  //     if (!pendingContracts) {
  //       throw new Error('QueryRegistry contract not available');
  //       // return [];
  //     }

  //     const contracts = await pendingContracts;

  //     const count = await contracts.queryRegistry.queryInfoCountByOwner(address);

  //     return await Promise.all(
  //       Array.from(new Array(count.toNumber()).keys()).map((_, index) =>
  //         contracts.queryRegistry.queryInfoIdsByOwner(address, index),
  //       ),
  //     );
  //   },
  //   [pendingContracts],
  // );

  return {
    registerQuery,
    getQuery,
    // getUserQueries,
    updateQueryMetadata,
    updateDeployment,
  };
}

export const { useContainer: useQueryRegistry, Provider: QueryRegistryProvider } = createContainer(
  useQueryRegistryImpl,
  { displayName: 'QueryRegistry' },
);
