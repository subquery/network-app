// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { NETWORKS_CONFIG_INFO, SQNetworks } from '@subql/network-config';
import { useAccount } from 'wagmi';

export const NETWORK_NAME: SQNetworks = import.meta.env.VITE_NETWORK;
export const isMainnet = import.meta.env.VITE_NETWORK === 'mainnet';
export const SUPPORTED_NETWORK = (isMainnet ? 'mainnet' : 'testnet') as SQNetworks;
export const defaultChainId = parseInt(NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK].chainId, 16);

export const ECOSYSTEM_NETWORK = NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK].chainName;

export const NETWORK_DEPLOYMENT_DETAILS = isMainnet ? mainnetJSON : testnetJSON;

// TODO: FIXME, Mainnet dont have this yet
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const SQT_TOKEN_ADDRESS = NETWORK_DEPLOYMENT_DETAILS.child.L2SQToken.address;

export interface SupportedConnectorsReturn {
  title?: string;
  description?: string;
  icon?: string;
}

export const useWeb3 = () => {
  const { address } = useAccount();
  return {
    account: address,
  };
};

export const ethMethods = {
  requestAccount: 'eth_requestAccounts',
  switchChain: 'wallet_switchEthereumChain',
  addChain: 'wallet_addEthereumChain',
};
