// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContracts, useIPFS, useProjectMetadata, useQueryRegistry } from '../containers';
import { ProjectDetails } from '../models';
import { AsyncData } from '../utils';
import { useAsyncMemo } from '.';
import { useCallback, useEffect, useState } from 'react';
import { BigNumber } from 'ethers';

export function useProject(id: string): AsyncData<ProjectDetails | undefined> {
  const { getQuery } = useQueryRegistry();
  const { catSingle } = useIPFS();
  const { getMetadataFromCid } = useProjectMetadata();
  const pendingContracts = useContracts();

  // Used to rerun async memo
  const [cacheBreak, setCacheBreak] = useState<number>(0);

  const sub = useCallback(async () => {
    if (!pendingContracts) {
      return () => undefined;
    }

    const contracts = await pendingContracts;
    const listener = (owner: string, queryId: unknown) => {
      /* TODO need updated query with indexed params*/
      if ((queryId as BigNumber).toHexString() !== id) {
        return;
      }
      setCacheBreak((val) => val + 1);
    };
    const deploymentFilter = contracts?.queryRegistry.filters.UpdateQueryDeployment(/*null, id*/);
    const metadataFilter = contracts?.queryRegistry.filters.UpdateQueryMetadata(/*null, id*/);

    contracts.queryRegistry.on(deploymentFilter, listener);
    contracts.queryRegistry.on(metadataFilter, listener);

    return () => {
      contracts.queryRegistry.off(deploymentFilter, listener);
      contracts.queryRegistry.off(metadataFilter, listener);
    };
  }, [pendingContracts, id]);

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
