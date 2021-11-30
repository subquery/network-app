// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from '.';
import { useIPFS } from '../containers';
import { useDeploymentQuery } from '../containers/QueryRegistryProject';
import { AsyncData, mergeAsyncLast } from '../utils';

type DeploymentMetadata = {
  versionId: string;
  version: string;
  description: string;
};

export async function getDeploymentMetadata(
  catSingle: (cid: string) => Promise<Uint8Array>,
  versionId: string | undefined,
): Promise<DeploymentMetadata | undefined> {
  if (!versionId) return undefined;

  const raw = await catSingle(versionId);

  const { version, description } = JSON.parse(Buffer.from(raw).toString('utf8'));

  return {
    versionId,
    version,
    description,
  };
}

export function useDeploymentMetadata(deploymentId: string | undefined): AsyncData<DeploymentMetadata | undefined> {
  const { catSingle } = useIPFS();
  const asyncDeployment = useDeploymentQuery({ deploymentId: deploymentId ?? '' });
  const asyncMetadata = useAsyncMemo(
    () => getDeploymentMetadata(catSingle, asyncDeployment.data?.deployment?.version),
    [catSingle, asyncDeployment.data?.deployment?.version],
  );

  return mergeAsyncLast(asyncDeployment, asyncMetadata);
}
