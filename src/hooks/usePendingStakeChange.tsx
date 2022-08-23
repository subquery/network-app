// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useContracts } from '../containers';
import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

// TODO: confirm latest change from contract
export function usePendingStakeChange(indexer: string): AsyncData<boolean> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    // const pendingStakers = await contracts.rewardsDistributor.getPendingStakers(indexer);
    // return pendingStakers.length > 0;
    return false;
  }, []);
}
