// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractReceipt } from '@ethersproject/contracts';

import { useProjectMetadata, useProjectRegistry } from '../containers';
import { NewDeployment } from '../models';

export function useCreateDeployment(
  projectId: string,
): (deploymentDetails: NewDeployment & { recommended: boolean }) => Promise<ContractReceipt> {
  const projectRegistry = useProjectRegistry();
  const { uploadVersionMetadata } = useProjectMetadata();

  const createDeployment = async (deploymentDetails: NewDeployment & { recommended: boolean }) => {
    const versionCid = await uploadVersionMetadata({
      version: deploymentDetails.version,
      description: deploymentDetails.description,
    });

    console.log('Uploaded version details', versionCid);
    debugger;
    const tx = await projectRegistry.updateDeployment(
      projectId,
      deploymentDetails.deploymentId,
      versionCid,
      deploymentDetails.recommended,
    );

    return await tx.wait(1);
  };

  return createDeployment;
}
