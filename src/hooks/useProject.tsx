// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { useWeb3Store } from 'src/stores';

import { useIPFS, useProjectMetadata, useProjectRegistry } from '../containers';
import { ProjectDetails } from '../models';
import { AsyncData } from '../utils';
import { useAsyncMemo } from '.';

export function useProject(id: string): AsyncData<ProjectDetails | undefined> {
  const { getQuery } = useProjectRegistry();
  const { catSingle } = useIPFS();
  const { getMetadataFromCid } = useProjectMetadata();

  return useAsyncMemo(async () => {
    if (!id) {
      return undefined;
    }

    const query = await getQuery(id);
    console.warn(query);
    if (!query) {
      return undefined;
    }

    const metadata = await getMetadataFromCid(query.metadata);
    return {
      id,
      owner: query.owner,
      version: query.version,
      metadata,
      deploymentId: query.deployment,
      type: query.type,
    };
  }, [id, catSingle, getMetadataFromCid, getQuery]);
}
