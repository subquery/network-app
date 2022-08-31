// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractSDK } from '@subql/contract-sdk';
import { useContracts } from '../containers';
import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export function useContractSDK(): AsyncData<ContractSDK> {
  const pendingContracts = useContracts();
  return useAsyncMemo(async () => {
    return await pendingContracts;
  }, []);
}
