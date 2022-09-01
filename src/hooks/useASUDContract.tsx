// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useContracts, useWeb3 } from '../containers';
import { AsyncData, initialAUSDContract, STABLE_TOKEN_DECIMAL } from '../utils';
import { useAsyncMemo, AsyncMemoReturn } from './useAsyncMemo';

/**
 * @returns useAUSDContract
 */
export function useAUSDContract(): AsyncData<Contract> {
  return useAsyncMemo(async () => {
    return await initialAUSDContract();
  }, []);
}

/**
 * @returns balance
 */
export function useAUSDBalance(): AsyncMemoReturn<string | undefined> {
  const { account } = useWeb3();
  return useAsyncMemo(async () => {
    const aUSDContract = await initialAUSDContract();
    if (!aUSDContract || !account) return undefined;
    const aUSD = await aUSDContract?.balanceOf(account);
    return formatUnits(aUSD, STABLE_TOKEN_DECIMAL);
  }, [account]);
}

/**
 * @returns useAUSDAllowance
 */
export function useAUSDAllowance(): AsyncMemoReturn<BigNumber> {
  const { account } = useWeb3();
  const pendingContracts = useContracts();

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    const aUSDContract = await initialAUSDContract();
    if (!aUSDContract || !account || !contracts) return BigNumber.from('0');

    return await aUSDContract.allowance(account, contracts.permissionedExchange.address);
  }, [account, pendingContracts]);
}

/**
 * @returns
 */
export function useAUSDTotalSupply(): AsyncData<BigNumber> {
  return useAsyncMemo(async () => {
    const aUSDContract = await initialAUSDContract();
    if (!aUSDContract) return BigNumber.from('0');

    return await aUSDContract.totalSupply();
  }, []);
}
