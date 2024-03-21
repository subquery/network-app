// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { AsyncMemoReturn, useAsyncMemo } from './useAsyncMemo';

// Jun 2022 commission-divUnit = perMil / 100 -> 10,000
export const COMMISSION_DIV_UNIT = 10000;

export function useCommissionRate(account: string | null | undefined): AsyncMemoReturn<{
  after: BigNumber;
  cur: BigNumber;
}> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');

    const rate = await contracts.indexerRegistry.commissionRates(account || '');

    return {
      after: rate.valueAfter.div(COMMISSION_DIV_UNIT),
      cur: rate.valueAt.div(COMMISSION_DIV_UNIT),
    };
  }, [contracts]);
}
