// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useIPFS, useProjectMetadata, useQueryRegistry } from '../containers';
import { ProjectDetails } from '../models';
import { AsyncData } from '../utils';
import { getDeployment } from './useDeployment';
import { useAsyncMemo } from '.';

export function useProject(id: string): AsyncData<ProjectDetails | undefined> {
  const { getQuery } = useQueryRegistry();
  const { catSingle } = useIPFS();
  const { getMetadataFromCid } = useProjectMetadata();

  return useAsyncMemo(async () => {
    if (!id) {
      return undefined;
    }

    const query = await getQuery(id);
    if (!query) {
      return undefined;
    }

    const metadata = await getMetadataFromCid(query.metadata);
    const deployment = await getDeployment(catSingle, query.deployment);

    return {
      id,
      owner: query.owner,
      metadata,
      deployment,
    };
  }, [id, catSingle, getMetadataFromCid, getQuery]);
}
