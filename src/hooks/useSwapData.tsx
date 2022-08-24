// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { useContracts } from '../containers';
import { AsyncData, convertStringToNumber } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

/**
 * @args: orderId
 * @returns amountGive/amountGet rate: number
 */
export function useSwapRate(orderId: number): AsyncData<number> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const [_, __, amountGive, amountGet] = await contracts.permissionedExchange.orders(orderId);

    return convertStringToNumber(formatEther(amountGive)) / convertStringToNumber(formatEther(amountGet));
  }, [pendingContracts]);
}

/**
 * @args: orderId
 * @returns swap pool
 */
export function useSwapPool(orderId: number): AsyncData<BigNumber> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const [_, __, amountGive, amountGet, sender, expireDate, pool] = await contracts.permissionedExchange.orders(
      orderId,
    );

    return pool;
  }, [pendingContracts]);
}

/**
 * @args: account
 * @returns tradable amount
 */
export function useSellSQTQuota(account: string): AsyncData<BigNumber> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const tradeQuota = await contracts.permissionedExchange.tradeQuota(contracts.sqToken.address, account);
    console.log('tradeQuota', tradeQuota);

    return await contracts.permissionedExchange.tradeQuota(contracts.sqToken.address, account);
  }, [pendingContracts]);
}
