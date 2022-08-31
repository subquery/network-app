// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, Contract } from 'ethers';
import { useContracts, useWeb3 } from '../containers';
import { AsyncData, initialAUSDContract } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

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
export function useAUSDBalance(): AsyncData<BigNumber | undefined> {
  return useAsyncMemo(async () => {
    const aUSDContract = await initialAUSDContract();
    if (!aUSDContract) return undefined;
    return await aUSDContract?.signer?.getBalance();
  }, []);
}

/**
 * @returns useAUSDAllowance
 */
export function useAUSDAllowance(): AsyncData<BigNumber> {
  const { account } = useWeb3();
  const pendingContracts = useContracts();

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    const aUSDContract = await initialAUSDContract();
    if (!aUSDContract || !account || !contracts) return BigNumber.from('0');

    return await aUSDContract.allowance(account, contracts.permissionedExchange.address);
  }, [account, pendingContracts]);
}
