// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { useIPFS, useProjectMetadata, useProjectRegistry } from '../containers';
import { FormProjectMetadata, ProjectMetadata } from '../models';

export function useUpdateProjectMetadata(projectId: string): (params: FormProjectMetadata) => Promise<void> {
  const { uploadMetadata } = useProjectMetadata();
  const { ipfs } = useIPFS();
  const { updateQueryMetadata } = useProjectRegistry();

  const updateMetadata = React.useCallback(
    async function (project: FormProjectMetadata): Promise<void> {
      // Form can give us a File type that doesn't match the schema
      if (project.image && typeof project.image !== 'string') {
        console.log('Uploading icon...');
        const res = await ipfs.add(project.image);
        project.image = res.cid.toString();
        console.log('Uploading icon...DONE');
      }

      const metadata = await uploadMetadata(project as ProjectMetadata);
      const tx = await updateQueryMetadata(projectId, metadata);
      const receipt = await tx.wait(1);

      if (!receipt.status) {
        throw new Error('Create project unsuccessful');
      }
    },
    [projectId, ipfs, uploadMetadata, updateQueryMetadata],
  );

  return updateMetadata;
}
