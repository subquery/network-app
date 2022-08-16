// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { InjectedConnector } from '@web3-react/injected-connector';
// import { NetworkConnector } from '@web3-react/network-connector';
import { providers } from 'ethers';
import React from 'react';
import { NetworkConnector } from '../NetworkConnector';

const RPC_URLS: Record<number, string> = {
  595: 'https://acala-mandala.api.onfinality.io/public',
};

const defaultChainId = 595;

export const injectedConntector = new InjectedConnector({
  supportedChainIds: [defaultChainId],
});

const networkConnector = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId,
});

export const NETWORK_CONFIGS = {
  'acala-testnet': {
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

export const Web3Provider: React.FC = (props) => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <InitProvider />
      {props.children}
    </Web3ReactProvider>
  );
};
