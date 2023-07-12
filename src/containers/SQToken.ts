// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { limitContract } from '@utils/limitation';
import assert from 'assert';

import { useWeb3Store } from 'src/stores';

import { useAsyncMemo } from '../hooks';
import { createContainer } from './Container';
import { useWeb3 } from '.';

function useSQTokenImpl() {
  const { account } = useWeb3();
  const { contracts } = useWeb3Store();
  const balance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return limitContract(() => contracts.sqToken.balanceOf(account));
  }, [account, contracts]);

  const consumerHostBalance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.consumerHost.consumers(account);
  }, [account, contracts]);

  const consumerHostAllowance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.consumerHost.address);
  }, [account, contracts]);

  const stakingAllowance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');
    return contracts.sqToken.allowance(account, contracts.staking.address);
  }, [account, contracts]);

  const planAllowance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.planManager.address);
  }, [account, contracts]);

  const offerAllowance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.purchaseOfferMarket.address);
  }, [account, contracts]);

  const permissionExchangeAllowance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');
    return limitContract(
      async () => await contracts.sqToken.allowance(account, contracts.permissionedExchange.address),
    );
  }, [account, contracts]);

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
