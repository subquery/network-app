import { useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { InjectedConnector } from '@web3-react/injected-connector';
import { NetworkConnector } from '@web3-react/network-connector';
import { providers } from 'ethers';
import React from 'react';

const RPC_URLS: Record<number, string> = {
  1285: 'wss://moonriver.api.onfinality.io/public-ws',
  1287: 'wss://moonbeam-alpha.api.onfinality.io/public-ws',
};

export const injectedConntector = new InjectedConnector({
  supportedChainIds: [1, 1285, 1287],
});

const networkConnector = new NetworkConnector({
  urls: RPC_URLS,
  defaultChainId: 1285,
});

function getLibrary(provider: any): providers.Web3Provider {
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
