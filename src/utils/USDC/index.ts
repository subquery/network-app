// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { waitForSomething } from '@utils/waitForSomething';
import { Contract, ethers } from 'ethers';

import abi from './USDC.json';

let loading = false;
export let AUSDContract: null | Contract = null;

// NOTE: Why not use hook: plan to move to network-client
export const STABLE_TOKEN_ADDRESS = import.meta.env.VITE_STABLE_TOKEN_ADDRESS;
export const STABLE_TOKEN_DECIMAL = 6;
export const initialAUSDContract = async (): Promise<Contract> => {
  if (loading) {
    await waitForSomething({
      func: () => loading,
    });
  }
  if (AUSDContract) return AUSDContract;
  loading = true;
  try {
    const ethereum = (window as any).ethereum;
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    const provider = new ethers.providers.Web3Provider(ethereum);
    const walletAddress = accounts[0]; // first account in MetaMask
    const signer = provider.getSigner(walletAddress);
    AUSDContract = new ethers.Contract(STABLE_TOKEN_ADDRESS, abi, signer);
    return AUSDContract;
  } finally {
    loading = false;
  }
};
