// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { bytes32ToCid } from '@utils';
import { limitQueue } from '@utils/limitation';
import assert from 'assert';
import localforage from 'localforage';

import { useWeb3Store } from 'src/stores/web3Account';

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
  options: {
    cid?: string;
    immediate: boolean;
  } = { immediate: true },
): {
  indexerMetadata: IndexerDetails;
  refresh: () => void;
} {
  const { contracts } = useWeb3Store();
  const fetchMetadata = useFetchMetadata();
  const [metadata, setMetadata] = useState<IndexerDetails>();

  const fetchCid = async () => {
    assert(contracts, 'Contracts not available');
    const res = await contracts.indexerRegistry.metadata(address);
    const decodeCid = bytes32ToCid(res);
    localforage.setItem(`${address}-metadata`, decodeCid);
    return decodeCid;
  };

  const fetchCidFromCache = async () => {
    const cacheCid = await localforage.getItem<string>(`${address}-metadata`);
    if (cacheCid) {
      return cacheCid;
    }
  };

  const refresh = async () => {
    await localforage.removeItem(`${address}-metadata`);
    init();
  };

  const init = async () => {
    if (options.immediate) {
      // fetch cid from cache first and use it for render.
      // then will fetch newest data from contract.
      let indexerCid = options.cid || (await fetchCidFromCache());

      if (!indexerCid) {
        indexerCid = (await limitQueue.add(() => fetchCid())) as string;
      } else {
        // refresh at next tick.
        setTimeout(() => refresh());
      }
      const res = await fetchMetadata(indexerCid);
      if (res) {
        setMetadata(res);
      }
    }
  };

  useEffect(() => {
    init();
  }, [options.immediate]);

  return {
    indexerMetadata: {
      name: undefined,
      url: undefined,
      image: undefined,
      ...metadata,
    },
    refresh,
  };
}
