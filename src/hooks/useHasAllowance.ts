// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useContracts, useWeb3 } from '../containers';
import { useAsyncMemo } from './useAsyncMemo';
import { assert } from '@polkadot/util';
import { BigNumber } from 'ethers';
import { AsyncData } from '../utils';

export function useHasAllowance(): AsyncData<BigNumber | undefined> & {
  refetch: (retainCurrent?: boolean | undefined) => void;
} {
  const pendingContracts = useContracts();
  const { account } = useWeb3();
  const hasAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.staking.address);
  }, [pendingContracts, account]);

  return hasAllowance;
}
