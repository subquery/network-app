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

export function useIndexerMetadata(address: string): IndexerDetails {
  const { contracts } = useWeb3Store();
  const { catSingle } = useIPFS();
  const [indexerCid, setIndexerCid] = useState('');
  const [metadata, setMetadata] = useState<{ name: string; url: string }>();

  const fetchCid = async () => {
    const cacheCid = await localforage.getItem<string>(`${address}-metadata`);
    if (cacheCid) {
      setIndexerCid(cacheCid);
      return;
    }
    assert(contracts, 'Contracts not available');

    const res = await contracts.indexerRegistry.metadata(address);
    const decodeCid = bytes32ToCid(res);
    localforage.setItem(`${address}-metadata`, decodeCid);
    setIndexerCid(decodeCid);
  };

  const fetchMetadata = async () => {
    try {
      const res = await catSingle(indexerCid);
      const decodeMetadata = decodeIpfsRaw<{ name: string; url: string }>(res);
      setMetadata(decodeMetadata);
    } catch (e) {
      parseError(e);
      localforage.removeItem(`${address}-metadata`);
    }
  };

  useEffect(() => {
    fetchCid();
  }, []);

  useEffect(() => {
    if (indexerCid) {
      fetchMetadata();
    }
  }, [indexerCid]);

  return {
    name: undefined,
    url: undefined,
    image: undefined,
    ...metadata,
  };

  // const indexerMetadata = useGetIndexerQuery({ variables: { address } }).data?.indexer?.metadata;

  // return {
  //   name: indexerMetadata?.name as string | undefined,
  //   image: undefined,
  //   url: indexerMetadata?.url as string | undefined,
  // };
}
