// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useIPFS, useQueryRegistry } from '../containers';
import { NewDeployment } from '../models';

export function useCreateDeployment(projectId: string) {
  const { ipfs } = useIPFS();
  const queryRegistry = useQueryRegistry();

  const createDeployment = async (deploymentDetails: NewDeployment) => {
    console.log('Uploading version details');
    const result = await ipfs.add(
      JSON.stringify({
        version: deploymentDetails.version,
        description: deploymentDetails.description,
      }),
      { pin: true },
    );

    // TODO validate provided IPFS cid is a deployment

    console.log('Uploaded version details', result.cid.toString());

    const tx = await queryRegistry.updateQuery(
      projectId,
      deploymentDetails.deploymentId,
      result.cid.toV0().toString(),
      'QmSTxccgiZQFiPtSUe11DZnyxb9zmTu3DgPRUKspiD6Nux' /* TODO get existing metadata*/,
    );

    await tx.wait(1);
  };

  return createDeployment;
}
