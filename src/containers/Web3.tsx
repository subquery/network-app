// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { InjectedConnector } from '@web3-react/injected-connector';
import { providers } from 'ethers';
import { NetworkConnector } from '@web3-react/network-connector';
import { TalismanConnector, TalismanWindow } from '../utils/TalismanConnector';

const MOONBEAM_NETWORK = 'moonbase-alpha';
const ACALA_NETWORK = 'acala-testnet';
export const NETWORKS: { [key: string]: { chainId: number; rpc: string } } = {
  [MOONBEAM_NETWORK]: {
    chainId: 1287,
    rpc: 'https://moonbeam-alpha.api.onfinality.io/public',
  },
  [ACALA_NETWORK]: {
    chainId: 595,
    rpc: 'https://acala-mandala-adapter.api.onfinality.io/public',
  },
};
export const SUPPORTED_NETWORK = MOONBEAM_NETWORK;
const defaultChainId = NETWORKS[SUPPORTED_NETWORK].chainId;
const RPC_URLS: Record<number, string> = Object.keys(NETWORKS).reduce((result, curNetwork) => {
  const network = NETWORKS[curNetwork];
  if (network) {
    return { ...result, [network.chainId]: network.rpc };
  }

  return result;
}, {});

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

const networkConnector = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId,
});

export const NETWORK_CONFIGS = {
  [MOONBEAM_NETWORK]: {
    chainId: `0x${Number(1287).toString(16)}`,
    chainName: 'Moonbase Alpha',
    nativeCurrency: {
      name: 'DEV',
      symbol: 'DEV',
      decimals: 18,
    },
    rpcUrls: [RPC_URLS[1287]],
    blockExplorerUrls: ['https://moonbase.moonscan.io/'],
  },
  [ACALA_NETWORK]: {
    chainId: `0x${Number(595).toString(16)}`,
    chainName: 'Acala Testnet',
    nativeCurrency: {
      name: 'ACA',
      symbol: 'ACA',
      decimals: 18,
    },
    rpcUrls: [RPC_URLS[595]],
    blockExplorerUrls: ['https://blockscout.mandala.acala.network/'],
  },
};

function getLibrary(provider: providers.ExternalProvider): providers.Web3Provider {
  // Acala would use https://github.com/AcalaNetwork/bodhi.js here
  return new providers.Web3Provider(provider);
}

export const useWeb3 = (): Web3ReactContextInterface<providers.Web3Provider> => useWeb3React();

const InitProvider: React.VFC = () => {
  const { activate } = useWeb3();

  const activateInitialConnector = React.useCallback(async () => {
    if (await injectedConntector.isAuthorized()) {
      activate(injectedConntector);

      return;
    }

    activate(networkConnector);
  }, [activate]);

  React.useEffect(() => {
    activateInitialConnector();
  }, [activateInitialConnector]);

  return null;
};

export const Web3Provider: React.FC = (props) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <InitProvider />
    {props.children}
  </Web3ReactProvider>
);
