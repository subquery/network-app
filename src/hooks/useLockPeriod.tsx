// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useWeb3Store } from 'src/stores';
import { AsyncData, convertBigNumberToNumber } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

/**
 * TODO: Fix the contracts not available issue when refresh on /lock path instead of push to there
 * - lockPeriod should fetch from contract
 * - lockPeriod unit: second
 */
export const defaultLockPeriod = 7200;

export function useLockPeriod(): AsyncData<number> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');

    const lockPeriod = await contracts.staking.lockPeriod();
    return convertBigNumberToNumber(lockPeriod);
  }, [contracts]);
}
