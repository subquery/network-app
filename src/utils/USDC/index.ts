// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ethers, Contract } from 'ethers';
import abi from './USDC.json';

// NOTE: Tmp solution and will replace with aUSD contract sdk
// NOTE: Why not use hook: plan to move to network-client
export const STABLE_TOKEN_ADDRESS = '0x24BCD6845616f72803681e2288547F3922a1C8f6';
export const STABLE_TOKEN_DECIMAL = 6;
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
