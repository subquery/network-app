// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { BigNumber } from 'ethers';
import { useContracts } from '../containers';
import { AsyncMemoReturn, useAsyncMemo } from './useAsyncMemo';

// Jun 2022 commission-divUnit = perMil / 100 -> 10,000
export const COMMISSION_DIV_UNIT = 10000;

export function useCommissionRate(account: string | null | undefined): AsyncMemoReturn<BigNumber | undefined> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const rate = await contracts.indexerRegistry.commissionRates(account || '');
    return rate.valueAfter.div(COMMISSION_DIV_UNIT);
  }, []);
}
