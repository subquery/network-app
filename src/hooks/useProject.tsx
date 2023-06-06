// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';

import { useWeb3Store } from 'src/stores';

import { useIPFS, useProjectMetadata, useQueryRegistry } from '../containers';
import { ProjectDetails } from '../models';
import { AsyncData } from '../utils';
import { useAsyncMemo } from '.';

export function useProject(id: string): AsyncData<ProjectDetails | undefined> {
  const { getQuery } = useQueryRegistry();
  const { catSingle } = useIPFS();
  const { getMetadataFromCid } = useProjectMetadata();
  const { contracts } = useWeb3Store();

  // Used to rerun async memo
  const [cacheBreak, setCacheBreak] = useState<number>(0);

  const sub = useCallback(async () => {
    if (!contracts) {
      return () => undefined;
    }

    const listener = (owner: string, queryId: unknown) => {
      setCacheBreak((val) => val + 1);
    };
    const deploymentFilter = contracts?.queryRegistry.filters.UpdateQueryDeployment(null, id);
    const metadataFilter = contracts?.queryRegistry.filters.UpdateQueryMetadata(null, id);

    contracts.queryRegistry.on(deploymentFilter, listener);
    contracts.queryRegistry.on(metadataFilter, listener);

    return () => {
      contracts.queryRegistry.off(deploymentFilter, listener);
      contracts.queryRegistry.off(metadataFilter, listener);
    };
  }, [contracts, id]);

  useEffect(() => {
    const pendingUnsub = sub();

    return () => {
      pendingUnsub.then((unsub) => unsub());
    };
  }, [sub]);

  return useAsyncMemo(async () => {
    if (!id) {
      return undefined;
    }

    const query = await getQuery(id);
    if (!query) {
      return undefined;
    }

    const metadata = await getMetadataFromCid(query.metadata);
    // const deployment = await getDeployment(catSingle, query.deployment);

    return {
      id,
      owner: query.owner,
      version: query.version,
      metadata,
      deploymentId: query.deployment,
    };
  }, [id, catSingle, getMetadataFromCid, getQuery, cacheBreak]);
}
