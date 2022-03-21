// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useContracts } from '../containers';
import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export function useIsIndexer(account: string | null | undefined): AsyncData<boolean> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const isIndexed = account ? await contracts.indexerRegistry.isIndexer(account) : false;
    return isIndexed;
  }, []);
}
