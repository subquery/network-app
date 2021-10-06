// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectMetadata, projectMetadataSchema } from '../models';
import { createContainer } from './Container';
import { useIPFS } from './IPFS';

function useProjectMetadataImpl() {
  const { ipfs, catSingle } = useIPFS();

  const getMetadataForProject = async (projectId: string): Promise<ProjectMetadata> => {
    // Load ipfs metadata cid from blockchain
    throw new Error('Not implemented');
  };

  const getMetadataFromCid = async (cid: string): Promise<ProjectMetadata> => {
    const result = await catSingle(cid);
    const rawMeta = JSON.parse(Buffer.from(result).toString('utf8'));
    return projectMetadataSchema.validate(rawMeta);
  };

  const uploadMetadata = async (meta: ProjectMetadata): Promise<string> => {
    await projectMetadataSchema.validate(meta);

    if (meta.image) {
      // TODO validate image is ipfs link
    }

    const result = await ipfs.add(Buffer.from(JSON.stringify(meta)), { pin: true });

    return result.cid.toString();
  };

  return {
    getMetadataForProject,
    getMetadataFromCid,
    uploadMetadata,
  };
}

export const { useContainer: useProjectMetadata, Provider: ProjectMetadataProvider } = createContainer<
  ReturnType<typeof useProjectMetadataImpl>,
  never
>(useProjectMetadataImpl, { displayName: 'ProjectMetadata' });
