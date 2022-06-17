// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useContracts, useWeb3 } from '.';
import { useAsyncMemo } from '../hooks';
import { createContainer } from './Container';

function useSQTokenImpl() {
  const { account } = useWeb3();
  const pendingContracts = useContracts();

  const balance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.balanceOf(account);
  }, [account, pendingContracts]);

  const stakingAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.staking.address);
  }, [account, pendingContracts]);

  const planAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.planManager.address);
  }, [account, pendingContracts]);

  const offerAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.purchaseOfferMarket.address);
  }, [account, pendingContracts]);

  return {
    balance,
    stakingAllowance,
    planAllowance,
    offerAllowance,
  };
}

export const { useContainer: useSQToken, Provider: SQTokenProvider } = createContainer(useSQTokenImpl, {
  displayName: 'SQToken',
});
