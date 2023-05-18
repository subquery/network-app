// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerRegistry, useIPFS } from '../containers';
import { IndexerDetails, indexerMetadataSchema } from '../models';
import { AsyncData, bytes32ToCid } from '../utils';
import { fetchIpfsMetadata } from './useIPFSMetadata';

export async function getIndexerMetadata(
  catSingle: (cid: string) => Promise<Uint8Array>,
  cid?: string | null,
): Promise<IndexerDetails | undefined> {
  if (!cid) return undefined;

  const obj = await fetchIpfsMetadata(catSingle, cid);

  return indexerMetadataSchema.validate(obj);
}

export function useIndexerMetadata(address: string): AsyncData<IndexerDetails | undefined> {
  const { getIndexer } = useIndexerRegistry();
  const { catSingle } = useIPFS();

  return useAsyncMemo(async () => {
    if (!address) return undefined;

    const metadataHash = await getIndexer(address);

    if (!metadataHash) return undefined;

    return getIndexerMetadata(catSingle, bytes32ToCid(metadataHash));
  }, [address, catSingle]);
}
