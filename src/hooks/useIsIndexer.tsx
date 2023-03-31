// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useWeb3Store } from 'src/stores';
import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export function useIsIndexer(account: string | null | undefined): AsyncData<boolean | undefined> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');

    return await contracts.indexerRegistry.isIndexer(account || '');
  }, [account, contracts]);
}
