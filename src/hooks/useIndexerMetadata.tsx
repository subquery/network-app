// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from './useAsyncMemo';
import { useIndexerRegistry, useIPFS } from '../containers';
import { IndexerDetails, indexerMetadataSchema } from '../models';
import { AsyncData, bytes32ToCid } from '../utils';
import { fetchIpfsMetadata } from './useIPFSMetadata';
import { useGetIndexerQuery } from '@subql/react-hooks';

export async function getIndexerMetadata(
  catSingle: (cid: string) => Promise<Uint8Array>,
  cid?: string | null,
): Promise<IndexerDetails | undefined> {
  if (!cid) return undefined;

  const obj = await fetchIpfsMetadata(catSingle, cid);

  return indexerMetadataSchema.validate(obj);
}

export function useIndexerMetadata(address: string): IndexerDetails | undefined {
  const indexerMetadata = useGetIndexerQuery({ variables: { address } }).data?.indexer?.metadata;

  return {
    name: indexerMetadata?.name as string | undefined,
    image: undefined,
    url: indexerMetadata?.url as string | undefined,
  };
}
