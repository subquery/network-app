// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

/**
 *
 * Web3Account
 *
 */

interface Web3Store {
  error?: any;
  setError: (error: any) => void;
  ethWindowObj?: any;
  setEthWindowObj: (setEthWindowObj?: string) => void;
  isInitialAccount?: boolean;
  setIsInitialAccount: (isInitialAccount: boolean) => void;
}

export const useWeb3Store = create<Web3Store>()((set) => ({
  ethWindowObj: window?.ethereum,
  isInitialAccount: false,
  setIsInitialAccount: (isInitialAccount: boolean) => set((state) => ({ ...state, isInitialAccount })),
  setEthWindowObj: (ethWindowObj: any) => set((state) => ({ ...state, ethWindowObj })),
  setError: (error: Error) => set((state) => ({ ...state, error })),
}));
