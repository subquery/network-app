// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from 'ethers';

import { AsyncMemoReturn } from './useAsyncMemo';
import { useAsyncMemo, useNetworkClient } from '.';

export function useMaxUnstakeAmount(indexer: string, eraNumber?: number): AsyncMemoReturn<BigNumber | undefined> {
  const networkClient = useNetworkClient();

  return useAsyncMemo(async () => {
    const maxUnstakeAmount = await networkClient?.maxUnstakeAmount(indexer ?? '', eraNumber || 0);
    return maxUnstakeAmount;
  }, [indexer, networkClient]);
}
