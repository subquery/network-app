// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractSDK, SQToken } from '@subql/contract-sdk';
import { ContractClient } from '@subql/network-clients';
import { ethers } from 'ethers';
import { create } from 'zustand';

/**
 *
 * Web3Account
 *
 */

interface rootContracts {
  sqToken: SQToken;
}

interface Web3Store {
  error?: any;
  setError: (error: any) => void;

  ethWindowObj?: any;
  setEthWindowObj: (setEthWindowObj?: string) => void;

  isInitialAccount?: boolean;
  setIsInitialAccount: (isInitialAccount: boolean) => void;

  ethProvider?: () => ethers.providers.JsonRpcProvider;

  contracts?: ContractSDK;
  setContracts: (contracts: ContractSDK) => void;

  rootContracts?: rootContracts;
  setRootContracts: (rootContracts: rootContracts) => void;

  contractClient?: ContractClient;
  setContractClient: (contracts: ContractClient) => void;
}

export const useWeb3Store = create<Web3Store>()((set) => ({
  ethWindowObj: window?.ethereum,
  contracts: undefined,
  isInitialAccount: false,
  rootContracts: undefined,
  setRootContracts: (rootContracts: rootContracts | undefined) => set((state) => ({ ...state, rootContracts })),
  ethProvider: () => {
    const providers = [
      new ethers.providers.JsonRpcProvider('https://eth.llamarpc.com'),
      new ethers.providers.JsonRpcProvider('https://ethereum.blockpi.network/v1/rpc/public'),
      new ethers.providers.JsonRpcProvider('https://rpc.payload.de'),
      new ethers.providers.JsonRpcProvider('https://ethereum.publicnode.com'),
      new ethers.providers.JsonRpcProvider('https://eth.drpc.org'),
      new ethers.providers.JsonRpcProvider('https://eth.merkle.io'),
    ];

    return providers[Math.floor(Math.random() * providers.length)];
  },

  setIsInitialAccount: (isInitialAccount: boolean) => set((state) => ({ ...state, isInitialAccount })),

  setEthWindowObj: (ethWindowObj: any) => set((state) => ({ ...state, ethWindowObj })),
  setError: (error: Error) => set((state) => ({ ...state, error })),

  setContracts: (contracts: ContractSDK | undefined) => set((state) => ({ ...state, contracts })),

  setContractClient: (contractClient: ContractClient | undefined) => set((state) => ({ ...state, contractClient })),
}));
