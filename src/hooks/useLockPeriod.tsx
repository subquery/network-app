// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import assert from 'assert';
import { useContracts, useWeb3 } from '../containers';
import { convertBigNumberToNumber } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export function useLockPeriod() {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const lockPeriod = await contracts.staking.lockPeriod();
    return convertBigNumberToNumber(lockPeriod);
  }, []);
}
