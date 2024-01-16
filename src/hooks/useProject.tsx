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
  const { contracts } = useWeb3Store();

  // Used to rerun async memo
  const [cacheBreak, setCacheBreak] = useState<number>(0);

  const sub = useCallback(async () => {
    if (!contracts || !id) {
      return () => undefined;
    }

    const listener = (owner: string, queryId: unknown) => {
      setCacheBreak((val) => val + 1);
    };
    const deploymentFilter = contracts?.projectRegistry.filters.ProjectDeploymentUpdated(null, id);
    const metadataFilter = contracts?.projectRegistry.filters.ProjectMetadataUpdated(null, id);

    contracts.projectRegistry.on(deploymentFilter, listener);
    contracts.projectRegistry.on(metadataFilter, listener);

    return () => {
      contracts.projectRegistry.off(deploymentFilter, listener);
      contracts.projectRegistry.off(metadataFilter, listener);
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
    return {
      id,
      owner: query.owner,
      version: query.version,
      metadata,
      deploymentId: query.deployment,
      type: query.type,
    };
  }, [id, catSingle, getMetadataFromCid, getQuery, cacheBreak]);
}
