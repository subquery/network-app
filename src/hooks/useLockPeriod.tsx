// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import assert from 'assert';
import { useContracts, useWeb3 } from '../containers';
import { convertBigNumberToNumber } from '../utils';

export function useLockPeriod(): number {
  const pendingContracts = useContracts();
  const [lockPeriod, setLockPeriod] = useState<number>();

  useEffect(() => {
    const getLockPeriod = async () => {
      const contracts = await pendingContracts;
      assert(contracts, 'Contracts not available');

      const lockPeriod = await contracts.staking.lockPeriod();
      const formattedLockPeriod = convertBigNumberToNumber(lockPeriod);
      setLockPeriod(formattedLockPeriod);
    };
    getLockPeriod();
  }, []);

  return lockPeriod || 0;
}
