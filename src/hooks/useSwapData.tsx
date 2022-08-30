// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import moment from 'moment';
import * as React from 'react';
import { useContracts, useOrders } from '../containers';
import { AsyncData, convertStringToNumber } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

/**
 * @args: orderId
 * @returns amountGive/amountGet rate: number
 */
export function useSwapRate(orderId: string | undefined): AsyncData<number> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    if (!orderId) return 0;

    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const { amountGive, amountGet } = await contracts.permissionedExchange.orders(orderId);

    return convertStringToNumber(formatEther(amountGive)) / convertStringToNumber(formatEther(amountGet));
  }, [pendingContracts]);
}

/**
 * @args: orderId
 * @returns swap pool
 */
export function useSwapPool(orderId: string | undefined): AsyncData<BigNumber> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    if (!orderId) return BigNumber.from(0);

    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const { amountGiveLeft } = await contracts.permissionedExchange.orders(orderId);

    return amountGiveLeft;
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

    return await contracts.permissionedExchange.tradeQuota(contracts.sqToken.address, account);
  }, [pendingContracts]);
}

/**
 * @args: tokenGive address
 * @returns orderId | undefined
 */
export function useSwapOrderId(swapFrom: string): string | undefined {
  const [orderId, setOrderId] = React.useState<string>();
  const [now, setNow] = React.useState<Date>(moment().toDate());
  const { data, loading } = useOrders({ swapFrom: swapFrom, now });

  React.useEffect(() => {
    const order = data?.orders?.nodes[0];
    if (order) {
      setOrderId(order?.id);
    }
  }, [data, loading]);

  return orderId;
}
