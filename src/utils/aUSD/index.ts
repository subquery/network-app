// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ethers, Contract } from 'ethers';
import abi from './aUSD.json';

// NOTE: Tmp solution and will replace with aUSD contract sdk
// NOTE: Why not use hook: plan to move to network-client
export const STABLE_TOKEN_ADDRESS = '0xF98bF104e268d7cBB7949029Fee874e3cd1db8fa';
export const STABLE_TOKEN_DECIMAL = 12;
export const initialAUSDContract = async (): Promise<Contract> => {
  const ethereum = (window as any).ethereum;
  const accounts = await ethereum.request({
    method: 'eth_requestAccounts',
  });
  const provider = new ethers.providers.Web3Provider(ethereum);
  const walletAddress = accounts[0]; // first account in MetaMask
  const signer = provider.getSigner(walletAddress);
  return new ethers.Contract(STABLE_TOKEN_ADDRESS, abi, signer);
};
