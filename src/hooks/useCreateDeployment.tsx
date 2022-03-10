// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractReceipt } from '@ethersproject/contracts';
import { useIPFS, useProjectMetadata, useQueryRegistry } from '../containers';
import { NewDeployment } from '../models';
import { getDeployment } from './useDeployment';

export function useCreateDeployment(projectId: string): (deploymentDetails: NewDeployment) => Promise<ContractReceipt> {
  const queryRegistry = useQueryRegistry();
  const { uploadVersionMetadata } = useProjectMetadata();
  const { catSingle } = useIPFS();

  const createDeployment = async (deploymentDetails: NewDeployment) => {
    console.log('Uploading version details');
    const versionCid = await uploadVersionMetadata({
      version: deploymentDetails.version,
      description: deploymentDetails.description,
    });

    try {
      await getDeployment(catSingle, deploymentDetails.deploymentId);
    } catch (e) {
      throw new Error('Deployment is not valid');
    }

    console.log('Uploaded version details', versionCid);

    const tx = await queryRegistry.updateDeployment(projectId, deploymentDetails.deploymentId, versionCid);

    return await tx.wait(1);
  };

  return createDeployment;
}
