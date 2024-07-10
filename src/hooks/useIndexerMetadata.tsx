// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGetIndexerLazyQuery } from '@subql/react-hooks';
import { limitQueue } from '@utils/limitation';
import localforage from 'localforage';

import { IndexerDetails, indexerMetadataSchema } from '../models';
import { useFetchMetadata } from './useFetchMetadata';
import { fetchIpfsMetadata } from './useIPFSMetadata';

export async function getIndexerMetadata(
  catSingle: (cid: string) => Promise<Uint8Array>,
  cid?: string | null,
): Promise<IndexerDetails | undefined> {
  if (!cid) return undefined;

  const obj = await fetchIpfsMetadata(catSingle, cid);

  return indexerMetadataSchema.validate(obj);
}

export function useIndexerMetadata(
  address: string,
  options?: {
    cid?: string;
    immediate?: boolean;
  },
): {
  indexerMetadata: IndexerDetails;
  refresh: () => void;
  loading: boolean;
} {
  const fetchMetadata = useFetchMetadata();
  const [metadata, setMetadata] = useState<IndexerDetails>();
  const [loading, setLoading] = useState(false);
  const [getIndexerQuery] = useGetIndexerLazyQuery();
  const mounted = useRef(false);
  const fetchCid = async () => {
    const res = await getIndexerQuery({
      variables: {
        address,
      },
      fetchPolicy: 'network-only',
    });

    const decodeCid = res.data?.indexer?.metadata || '';

    localforage.setItem(`${address}-metadata`, decodeCid);
    return decodeCid;
  };
  const optionWithDefault = useMemo(() => {
    return { immediate: true, ...options };
  }, [options]);

  const fetchCidFromCache = async () => {
    const cacheCid = await localforage.getItem<string>(`${address}-metadata`);
    if (cacheCid) {
      return cacheCid;
    }
  };

  const refresh = async () => {
    await localforage.removeItem(`${address}-metadata`);
    init('contract');
  };

  const init = async (mode: 'cache-first' | 'contract' = 'cache-first') => {
    try {
      setLoading(true);
      // fetch cid from cache(& options.cid) first and use it for render.
      // then will fetch newest data from contract.
      let indexerCid = optionWithDefault.cid || (await fetchCidFromCache());
      if (mode === 'contract') {
        indexerCid = (await limitQueue.add(() => fetchCid())) as string;
      } else {
        // refresh at next tick.
        setTimeout(() => refresh());
      }
      const res = await fetchMetadata(indexerCid);

      if (res) {
        setMetadata(res);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (optionWithDefault.immediate) {
      init();
    }
  }, [optionWithDefault.immediate]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!address) return;
    refresh();
  }, [address]);

  return {
    indexerMetadata: {
      name: undefined,
      url: undefined,
      image: undefined,
      ...metadata,
    },
    refresh,
    loading,
  };
}
