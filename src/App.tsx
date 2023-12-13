// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppInitProvider } from '@containers/AppInitialProvider';

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

const RenderRouter: React.FC = () => {
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
