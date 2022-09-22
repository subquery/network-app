// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from 'ethers';
import { useAsyncMemo, useNetworkClient } from '.';
import { AsyncMemoReturn } from './useAsyncMemo';

export function useMaxUnstakeAmount(indexer: string): AsyncMemoReturn<BigNumber> {
  const networkClient = useNetworkClient();

  return useAsyncMemo(async () => {
    const maxUnstakeAmount = await networkClient?.maxUnstakeAmount(indexer ?? '');
    return maxUnstakeAmount ?? BigNumber.from(0);
  }, [indexer, networkClient]);
}
