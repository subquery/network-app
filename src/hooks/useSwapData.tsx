// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BigNumberish } from '@ethersproject/bignumber';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import moment from 'moment';

import { useWeb3Store } from 'src/stores';

import { useOrders } from '../containers';
import { convertStringToNumber, tokenDecimals, tokenNames } from '../utils';
import { AsyncMemoReturn, useAsyncMemo } from './useAsyncMemo';

export function formatToken(value: BigNumberish, unit = 18): number {
  return convertStringToNumber(formatUnits(value, unit));
}

export function useSwapToken(
  orderId: string | undefined,
): AsyncMemoReturn<{ tokenGet: string; tokenGive: string } | undefined> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    if (!orderId) return undefined;

    assert(contracts, 'Contracts not available');

    const { tokenGet, tokenGive } = await contracts.permissionedExchange.orders(orderId);
    return { tokenGet: tokenNames[tokenGet], tokenGive: tokenNames[tokenGive] };
  }, [contracts, orderId]);
}

/**
 * @args: orderId
 * @returns amountGet/amountGive rate: number
 */
export function useSwapRate(orderId: string | undefined): AsyncMemoReturn<number> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    if (!orderId) return 0;

    assert(contracts, 'Contracts not available');

    const { amountGive, amountGet, tokenGet, tokenGive } = await contracts.permissionedExchange.orders(orderId);
    return formatToken(amountGive, tokenDecimals[tokenGive]) / formatToken(amountGet, tokenDecimals[tokenGet]);
  }, [contracts, orderId]);
}

export function useSwapTradeLimitation() {
  const { contracts } = useWeb3Store();

  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    if (contracts.permissionedExchange) {
      const limitation = await contracts.permissionedExchange.tradeLimitation();
      return limitation;
    }

    return BigNumber.from(0);
  }, [contracts]);
}

/**
 * @args: orderId
 * @returns swap pool
 */
export function useSwapPool(orderId: string | undefined): AsyncMemoReturn<BigNumber> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    if (!orderId) return BigNumber.from(0);

    assert(contracts, 'Contracts not available');

    const { tokenGiveBalance } = await contracts.permissionedExchange.orders(orderId);

    return tokenGiveBalance;
  }, [contracts, orderId]);
}

/**
 * @args: account
 * @returns tradable amount
 */
export function useSellSQTQuota(account: string): AsyncMemoReturn<BigNumber> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');

    return await contracts.permissionedExchange.tradeQuota(contracts.sqToken.address, account);
  }, [contracts]);
}

/**
 * @args: tokenGive address
 * @returns orderId | undefined
 */
export function useSwapOrderId(swapFrom: string): { orderId: string | undefined; loading: boolean } {
  const mountedRef = React.useRef(true);
  const [orderId, setOrderId] = React.useState<string>();
  const [now, setNow] = React.useState<Date>(moment().toDate());
  // TODO: swapFrom now is reversed should be equal to contracts.
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
