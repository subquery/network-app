// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useContracts, useWeb3 } from '.';
import { useAsyncMemo } from '../hooks';
import { createContainer } from './Container';

// TODO: maintain the state in redux
function useSQTokenImpl() {
  const { account } = useWeb3();
  const pendingContracts = useContracts();

  const balance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.balanceOf(account);
  }, [account, pendingContracts]);

  const consumerHostBalance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.consumerHost.consumers(account);
  }, [account, pendingContracts]);

  const consumerHostAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.consumerHost.address);
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

  const permissionExchangeAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.permissionedExchange.address);
  }, [account, pendingContracts]);

  return {
    balance,
    consumerHostBalance,
    stakingAllowance,
    planAllowance,
    offerAllowance,
    permissionExchangeAllowance,
    consumerHostAllowance,
  };
}

export const { useContainer: useSQToken, Provider: SQTokenProvider } = createContainer(useSQTokenImpl, {
  displayName: 'SQToken',
});
