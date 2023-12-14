// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect } from 'react';
import { useGetDeploymentLazyQuery } from '@subql/react-hooks';

import { useIPFS } from '../containers';
import { AsyncData, mergeAsyncLast } from '../utils';
import { useAsyncMemo } from '.';

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
  const [loadDeployment, asyncDeployment] = useGetDeploymentLazyQuery();
  const asyncMetadata = useAsyncMemo(
    () => getDeploymentMetadata(catSingle, asyncDeployment.data?.deployment?.metadata),
    [catSingle, asyncDeployment.data?.deployment?.metadata],
  );

  useEffect(() => {
    if (deploymentId) {
      loadDeployment({
        variables: {
          deploymentId,
        },
      });
    }
  }, [deploymentId]);

  return mergeAsyncLast(asyncDeployment, asyncMetadata);
}
