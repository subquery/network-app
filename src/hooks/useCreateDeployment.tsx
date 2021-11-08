// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useProjectMetadata, useQueryRegistry } from '../containers';
import { NewDeployment } from '../models';

export function useCreateDeployment(projectId: string) {
  const queryRegistry = useQueryRegistry();
  const { uploadVersionMetadata } = useProjectMetadata();

  const createDeployment = async (deploymentDetails: NewDeployment) => {
    console.log('Uploading version details');
    const versionCid = await uploadVersionMetadata({
      version: deploymentDetails.version,
      description: deploymentDetails.description,
    });

    // TODO validate provided IPFS cid is a deployment

    console.log('Uploaded version details', versionCid);

    const tx = await queryRegistry.updateDeployment(projectId, deploymentDetails.deploymentId, versionCid);

    await tx.wait(1);
  };

  return createDeployment;
}
