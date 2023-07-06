// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useIPFS } from '@containers';
import { decodeIpfsRaw } from '@containers/IPFS';
import { bytes32ToCid, parseError } from '@utils';
import assert from 'assert';
import localforage from 'localforage';

import { useWeb3Store } from 'src/stores/web3Account';

import { IndexerDetails, indexerMetadataSchema } from '../models';
import { fetchIpfsMetadata } from './useIPFSMetadata';

export async function getIndexerMetadata(
  catSingle: (cid: string) => Promise<Uint8Array>,
  cid?: string | null,
): Promise<IndexerDetails | undefined> {
  if (!cid) return undefined;

  const obj = await fetchIpfsMetadata(catSingle, cid);

  return indexerMetadataSchema.validate(obj);
}

export function useIndexerMetadata(address: string): {
  indexerMetadata: IndexerDetails;
  refresh: () => void;
} {
  const { contracts } = useWeb3Store();
  const { catSingle } = useIPFS();
  const [metadata, setMetadata] = useState<IndexerDetails>();

  const fetchCid = async () => {
    // TODO: restore this cache(maybe)
    // Question in here: refresh is not convenient and not very necessary.
    // const cacheCid = await localforage.getItem<string>(`${address}-metadata`);
    // if (cacheCid) {
    //   return cacheCid;
    // }
    assert(contracts, 'Contracts not available');

    const res = await contracts.indexerRegistry.metadata(address);
    const decodeCid = bytes32ToCid(res);
    localforage.setItem(`${address}-metadata`, decodeCid);
    return decodeCid;
  };

  const fetchMetadata = async () => {
    try {
      const indexerCid = await fetchCid();
      const res = await catSingle(indexerCid);
      const decodeMetadata = decodeIpfsRaw<IndexerDetails>(res);
      setMetadata(decodeMetadata);
    } catch (e) {
      parseError(e);
      localforage.removeItem(`${address}-metadata`);
    }
  };

  const refresh = async () => {
    await localforage.removeItem(`${address}-metadata`);
    fetchMetadata();
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

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
