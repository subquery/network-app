// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { InjectedConnector } from '@web3-react/injected-connector';
import { providers } from 'ethers';
import { NetworkConnector } from '@web3-react/network-connector';
import { TalismanConnector, TalismanWindow } from '../utils/TalismanConnector';
import { networks } from '@subql/contract-sdk';

export const defaultChainId = parseInt(networks.testnet.chainId, 16);

export const RPC_URLS: Record<number, string> = {
  80001: 'https://polygon-mumbai.infura.io/v3/4458cf4d1689497b9a38b1d6bbf05e78',
  137: 'https://polygon-rpc.com/',
};

export const SUPPORTED_NETWORK = 'testnet';

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

export const Web3Provider: React.FC<{ children: React.ReactNode }> = (props) => (
  <Web3ReactProvider getLibrary={getLibrary}>
    <InitProvider />
    {props.children}
  </Web3ReactProvider>
);
