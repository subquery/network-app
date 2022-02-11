// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ProjectManifestVersioned, VersionedProjectManifest } from '@subql/common/dist/project';
import { useIPFS } from '../containers';
import { useAsyncMemo } from './useAsyncMemo';
import { ProjectDeployment } from '../models';
import { AsyncData } from '../utils';
import { fetchIpfsMetadata } from './useIPFSMetadata';

export async function getDeployment(
  catSingle: (cid: string) => Promise<Uint8Array>,
  deploymentId: string,
): Promise<ProjectDeployment> {
  const obj = await fetchIpfsMetadata<VersionedProjectManifest>(catSingle, deploymentId);

  const manifest = new ProjectManifestVersioned(obj);
  manifest.validate();

  // const schema = await catSingle(manifest.schema.replace('ipfs://', ''))
  //   .then((data) => Buffer.from(data).toString())
  //   .then((str) => buildSchema(str));

  return {
    id: deploymentId,
    manifest,
    // schema,
  };
}

export function useDeployment(deploymentId: string | undefined): AsyncData<ProjectDeployment | undefined> {
  const { catSingle } = useIPFS();

  return useAsyncMemo<ProjectDeployment | undefined>(async () => {
    if (!deploymentId) {
      return undefined;
    }
    return getDeployment(catSingle, deploymentId);
  }, [deploymentId]);
}
