// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerRegistry, useIPFS } from '../containers';
import { IndexerDetails, indexerMetadataSchema } from '../models';
import { AsyncData, bytes32ToCid } from '../utils';

export function useIndexerMetadata(address: string): AsyncData<IndexerDetails | undefined> {
  const { getIndexer } = useIndexerRegistry();
  const { catSingle } = useIPFS();

  return useAsyncMemo(async () => {
    if (!address) return undefined;

    const metadataHash = await getIndexer(address);

    if (!metadataHash) return undefined;

    const data = await catSingle(bytes32ToCid(metadataHash));
    const obj = JSON.parse(Buffer.from(data).toString());

    return await indexerMetadataSchema.validate(obj);
  }, [address, catSingle]);
}
