// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { limitContract, makeCacheKey } from '@utils/limitation';
import assert from 'assert';

import { useWeb3Store } from 'src/stores';

import { AsyncData, convertBigNumberToNumber } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export function useLockPeriod(): AsyncData<number> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    const lockPeriod = await limitContract(() => contracts.staking.lockPeriod(), makeCacheKey('lockPeriod'), 0);

    return convertBigNumberToNumber(lockPeriod);
  }, [contracts]);
}
