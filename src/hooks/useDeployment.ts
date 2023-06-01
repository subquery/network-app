// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import {
  SubstrateProjectManifestVersioned,
  VersionedProjectManifest,
} from '@subql/common-substrate/dist/project/versioned';

import { useIPFS } from '../containers';
import { ProjectDeployment } from '../models';
import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';
import { fetchIpfsMetadata } from './useIPFSMetadata';

export async function getDeployment(
  catSingle: (cid: string) => Promise<Uint8Array>,
  deploymentId: string,
): Promise<ProjectDeployment> {
  const obj = await fetchIpfsMetadata<VersionedProjectManifest>(catSingle, deploymentId);

  const manifest = new SubstrateProjectManifestVersioned(obj);
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
