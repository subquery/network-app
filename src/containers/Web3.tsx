// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { NETWORKS_CONFIG_INFO, SQNetworks } from '@subql/network-config';
import { base, baseSepolia } from 'viem/chains';
import { mainnet, sepolia, useAccount as useAccountWagmi } from 'wagmi';

export const NETWORK_NAME: SQNetworks = import.meta.env.VITE_NETWORK;
export const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
export const SUPPORTED_NETWORK = (isMainnet ? 'mainnet' : 'testnet') as SQNetworks;
export const defaultChainId = parseInt(NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK].chainId, 16);

export const ECOSYSTEM_NETWORK = NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK].chainName;

export const NETWORK_DEPLOYMENT_DETAILS = isMainnet ? mainnetJSON : testnetJSON;

export const l1Chain = import.meta.env.VITE_NETWORK === 'testnet' ? sepolia : mainnet;
export const l2Chain = import.meta.env.VITE_NETWORK === 'testnet' ? baseSepolia : base;

// TODO: FIXME, Mainnet dont have this yet

// @ts-ignore
export const SQT_TOKEN_ADDRESS = NETWORK_DEPLOYMENT_DETAILS.child.L2SQToken.address;

export interface SupportedConnectorsReturn {
  title?: string;
  description?: string;
  icon?: string;
}

export const useAccount = () => {
  const accountFromWagmi = useAccountWagmi();

  const account = new URL(window.location.href).searchParams.get('customAddress') || accountFromWagmi.address;
  return {
    ...accountFromWagmi,
    address: account,
    account,
  };
};

export const useWeb3 = useAccount;

export const ethMethods = {
  requestAccount: 'eth_requestAccounts',
  switchChain: 'wallet_switchEthereumChain',
  addChain: 'wallet_addEthereumChain',
};
