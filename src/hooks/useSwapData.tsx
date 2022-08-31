// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import moment from 'moment';
import * as React from 'react';
import { useContracts, useOrders } from '../containers';
import { AsyncData, convertStringToNumber, tokenDecimals, tokenNames } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';
import { BigNumberish } from '@ethersproject/bignumber';

export function formatToken(value: BigNumberish, unit = 18): number {
  return convertStringToNumber(formatUnits(value, unit));
}

export function useSwapToken(
  orderId: string | undefined,
): AsyncData<{ tokenGet: string; tokenGive: string } | undefined> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    if (!orderId) return undefined;

    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const { tokenGet, tokenGive } = await contracts.permissionedExchange.orders(orderId);
    return { tokenGet: tokenNames[tokenGet], tokenGive: tokenNames[tokenGive] };
  }, [pendingContracts, orderId]);
}

/**
 * @args: orderId
 * @returns amountGet/amountGive rate: number
 */
export function useSwapRate(orderId: string | undefined): AsyncData<number> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    if (!orderId) return 0;

    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const { amountGive, amountGet, tokenGet, tokenGive } = await contracts.permissionedExchange.orders(orderId);
    return formatToken(amountGive, tokenDecimals[tokenGive]) / formatToken(amountGet, tokenDecimals[tokenGet]);
  }, [pendingContracts, orderId]);
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
  }, [pendingContracts, orderId]);
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
export function useSwapOrderId(swapFrom: string): { orderId: string | undefined; loading: boolean } {
  const mountedRef = React.useRef(true);
  const [orderId, setOrderId] = React.useState<string>();
  const [now, setNow] = React.useState<Date>(moment().toDate());
  const { data, loading } = useOrders({ swapFrom: swapFrom, now });

  React.useEffect(() => {
    const order = data?.orders?.nodes[0];
    if (order) {
      setOrderId(order?.id);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [data, loading]);

  return { orderId, loading };
}
