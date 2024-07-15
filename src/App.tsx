// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { useAccount } from '@containers/Web3';
import { useEthersProviderWithPublic, useEthersSigner } from '@hooks/useEthersProvider';

import { RainbowProvider } from './config/rainbowConf';
import { ChainStatus, Header } from './components';
import {
  IPFSProvider,
  ProjectMetadataProvider,
  ProjectRegistryProvider,
  QueryApolloProvider,
  SQTokenProvider,
} from './containers';
import RouterComponent from './router';

import './App.css';

// TODO: Remove SQTProvider
const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <RainbowProvider>
          <AppInitProvider>
            <ProjectMetadataProvider>
              <ProjectRegistryProvider>
                <SQTokenProvider>{children}</SQTokenProvider>
              </ProjectRegistryProvider>
            </ProjectMetadataProvider>
          </AppInitProvider>
        </RainbowProvider>
      </QueryApolloProvider>
    </IPFSProvider>
  );
};

const makeDebugInfo = (debugInfo: object) => {
  window.debugInfo = debugInfo;
};

const RenderRouter: React.FC = () => {
  const { address, connector, isConnected } = useAccount();
  const { signer } = useEthersSigner();
  const provider = useEthersProviderWithPublic();

  useEffect(() => {
    (async () => {
      makeDebugInfo({
        address,
        walletName: connector?.name,
        signerAddress: 'not collected',
        signerChainId: 'not collected',
        providerNetwork: provider._network.name,
        isConnected: isConnected,
      });

      const signerAddress = await signer?.getAddress();
      const signerChainId = await signer?.getChainId();
      makeDebugInfo({
        address,
        walletName: connector?.name,
        signerAddress,
        signerChainId,
        providerNetwork: provider._network.name,
        isConnected: isConnected,
      });
    })();
  }, [address, connector, signer, provider]);

  return (
    <BrowserRouter>
      <div className="Main">
        <div className="Header">
          <Header />
        </div>

        <div className="Content">
          <ChainStatus>
            <RouterComponent></RouterComponent>
          </ChainStatus>
        </div>
      </div>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <Providers>
      <div className="App">
        <RenderRouter />
      </div>
    </Providers>
  );
};
