// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import keplerJSON from '@subql/contract-sdk/publish/kepler.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { NETWORKS_CONFIG_INFO, SQNetworks } from '@subql/network-config';
import { parseError } from '@utils/parseError';
import { InjectedConnector } from '@web3-react/injected-connector';
import { useAccount } from 'wagmi';

import { TalismanConnector, TalismanWindow } from '../utils/TalismanConnector';

export const NETWORK_NAME: SQNetworks = import.meta.env.VITE_NETWORK;
export const isMainnet = import.meta.env.VITE_NETWORK === 'kepler';
export const SUPPORTED_NETWORK = (isMainnet ? 'kepler' : 'testnet') as SQNetworks;
export const defaultChainId = parseInt(NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK].chainId, 16);

export const ECOSYSTEM_NETWORK = NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK].chainName;

export const NETWORK_DEPLOYMENT_DETAILS = isMainnet ? keplerJSON : testnetJSON;

export const SQT_TOKEN_ADDRESS = NETWORK_DEPLOYMENT_DETAILS.SQToken.address;

export const RPC_URLS: Record<number, string> = {
  80001: 'https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78',
  137: 'https://polygon-rpc.com/',
};

export const injectedConntector = new InjectedConnector({
  supportedChainIds: [defaultChainId],
});

// Talisman wallet connector
export const talismanConnector = new TalismanConnector({
  supportedChainIds: [defaultChainId],
});

export type SUPPORTED_CONNECTORS_TYPE = InjectedConnector | TalismanConnector;
export interface SupportedConnectorsReturn {
  connector: SUPPORTED_CONNECTORS_TYPE;
  windowObj: any;
  title?: string;
  description?: string;
  icon?: string;
}
export const SUPPORTED_CONNECTORS: { [key: string]: SupportedConnectorsReturn } = {
  INJECTED: {
    connector: injectedConntector,
    windowObj: window.ethereum,
    title: 'Connect with Metamask',
    description: 'Connect with Metamask browser extension',
    icon: '/static/metamask.png',
  },

  TALISMAN: {
    connector: talismanConnector,
    windowObj: (window as TalismanWindow).talismanEth,
    title: 'Connect with Talisman',
    description: 'Connect with Talisman browser extension',
    icon: '/static/talisman.png',
  },
};

export const ALL_SUPPORTED_CONNECTORS = Object.keys(SUPPORTED_CONNECTORS).map(
  (supportConnector) => SUPPORTED_CONNECTORS[supportConnector],
);

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

export const handleSwitchNetwork = async (ethWindowObj = window?.ethereum) => {
  if (!ethWindowObj) return;

  try {
    await ethWindowObj.request({
      method: ethMethods.switchChain,
      params: [{ chainId: `0x${Number(defaultChainId).toString(16)}` }],
    });
  } catch (e: any) {
    parseError(e);
    if (e?.code === 4902) {
      await ethWindowObj.request({
        method: ethMethods.addChain,
        params: [NETWORKS_CONFIG_INFO[SUPPORTED_NETWORK]],
      });
    }
  }
};
