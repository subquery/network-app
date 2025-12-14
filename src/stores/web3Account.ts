// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DelegationPool } from '@pages/delegator/Pool/contracts/delegationPool';
import { RootContractSDK } from '@subql/contract-sdk/rootSdk';
import { ContractSDK } from '@subql/contract-sdk/sdk';
import { ContractClient } from '@subql/network-clients';
import { ethers } from 'ethers';
import { create } from 'zustand';

/**
 *
 * Web3Account
 *
 */

type ContractSDKWithDelegationPool = ContractSDK & { delegationPool: DelegationPool };

interface Web3Store {
  error?: any;
  setError: (error: any) => void;

  isInitialAccount?: boolean;
  setIsInitialAccount: (isInitialAccount: boolean) => void;

  contracts?: ContractSDKWithDelegationPool;
  setContracts: (contracts: ContractSDKWithDelegationPool) => void;

  rootContracts?: RootContractSDK;
  setRootContracts: (rootContracts: RootContractSDK) => void;

  contractClient?: ContractClient;
  setContractClient: (contracts: ContractClient) => void;
}

export const useWeb3Store = create<Web3Store>()((set) => ({
  contracts: undefined,
  isInitialAccount: false,
  rootContracts: undefined,
  setRootContracts: (rootContracts: RootContractSDK | undefined) => set((state) => ({ ...state, rootContracts })),

  setIsInitialAccount: (isInitialAccount: boolean) => set((state) => ({ ...state, isInitialAccount })),

  setError: (error: Error) => set((state) => ({ ...state, error })),

  setContracts: (contracts: ContractSDKWithDelegationPool | undefined) => set((state) => ({ ...state, contracts })),

  setContractClient: (contractClient: ContractClient | undefined) => set((state) => ({ ...state, contractClient })),
}));
