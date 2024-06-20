// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { cidToBytes32 } from '@subql/network-clients';
import { BigNumber, BigNumberish, ContractTransaction } from 'ethers';

import { ProjectType } from 'src/models';
import { useWeb3Store } from 'src/stores';

import { bytes32ToCid } from '../utils';
import { createContainer, Logger } from './Container';

type QueryDetails = {
  queryId: BigNumber;
  owner: string;
  metadata: string; // IPFS Cid
  deployment: string; // IPFS Cid
  version: string; // IPFS Cid
  type: ProjectType;
};

function useProjectRegistryImpl(logger: Logger) {
  const { contracts } = useWeb3Store();

  const projectCache = React.useRef<Record<string, QueryDetails>>({});

  const registerProject = async (
    type: ProjectType,
    metadataCid: string,
    deploymentId: string,
    deploymentMetadata: string,
  ): Promise<ContractTransaction> => {
    // Call contract function to register a new project, should emit an event with an id
    if (!contracts) {
      throw new Error('ProjectRegistry contract not available');
    }

    return contracts?.projectRegistry.createProject(
      metadataCid,
      cidToBytes32(deploymentMetadata),
      cidToBytes32(deploymentId),
      type,
    );
  };

  const updateQueryMetadata = async (id: BigNumberish, metadataCid: string): Promise<ContractTransaction> => {
    if (!contracts) {
      throw new Error('ProjectRegistry contract not available');
    }

    const tx = await contracts.projectRegistry.updateProjectMetadata(id, metadataCid);

    tx.wait().then((receipt) => {
      if (!receipt.status) {
        return;
      }

      projectCache.current[BigNumber.from(id).toString()] = {
        ...projectCache.current[BigNumber.from(id).toString()],
        metadata: metadataCid,
      };
    });

    return tx;
  };

  const updateDeployment = async (
    id: BigNumberish,
    deploymentId: string,
    version: string,
    recommended?: boolean,
  ): Promise<ContractTransaction> => {
    if (!contracts) {
      throw new Error('ProjectRegistry contract not available');
    }

    const tx = await contracts.projectRegistry.addOrUpdateDeployment(
      id,
      cidToBytes32(deploymentId),
      cidToBytes32(version),
      !!recommended,
    );

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
      const projectRegistry = contracts.projectRegistry;
      const [project, owner, uri] = await Promise.all([
        projectRegistry.projectInfos(id),
        projectRegistry.ownerOf(id),
        projectRegistry.tokenURI(id),
      ]);

      const deploymentInfo = await projectRegistry.deploymentInfos(
        project.latestDeploymentId.startsWith('Qm')
          ? cidToBytes32(project.latestDeploymentId)
          : project.latestDeploymentId,
      );

      projectCache.current[BigNumber.from(id).toString()] = {
        owner,
        queryId: BigNumber.from(id),
        metadata: uri.replace(/^ipfs:\/\//, ''),
        deployment: bytes32ToCid(project.latestDeploymentId),
        version: bytes32ToCid(deploymentInfo.metadata),
        type: project.projectType,
      };
    }

    return projectCache.current[BigNumber.from(id).toString()];
  };

  return {
    registerProject,
    getQuery,
    updateQueryMetadata,
    updateDeployment,
  };
}

export const { useContainer: useProjectRegistry, Provider: ProjectRegistryProvider } = createContainer(
  useProjectRegistryImpl,
  { displayName: 'ProjectRegistry' },
);
