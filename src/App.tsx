// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren, useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { useStudioEnabled } from '@hooks';
import { entryLinks, externalAppLinks, studioLink } from '@utils/links';

import { ChainStatus, Header } from './components';
import {
  IPFSProvider,
  ProjectMetadataProvider,
  QueryApolloProvider,
  QueryRegistryProvider,
  SQTokenProvider,
  Web3Provider,
} from './containers';
import RouterComponent from './router';

import './App.css';

// TODO: Remove SQTProvider
const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <Web3Provider>
          <AppInitProvider>
            <ProjectMetadataProvider>
              <QueryRegistryProvider>
                <SQTokenProvider>{children}</SQTokenProvider>
              </QueryRegistryProvider>
            </ProjectMetadataProvider>
          </AppInitProvider>
        </Web3Provider>
      </QueryApolloProvider>
    </IPFSProvider>
  );
};

const RenderRouter: React.FC = () => {
  const studioEnabled = useStudioEnabled();
  const calEntryLinks = useMemo(() => (studioEnabled ? [...entryLinks, studioLink] : [...entryLinks]), [studioEnabled]);

  return (
    <BrowserRouter>
      <div className="Main">
        <div className="Header">
          {/* TODO: replace with component from ui library */}
          <Header appNavigation={calEntryLinks} dropdownLinks={{ label: 'Kepler', links: externalAppLinks }} />
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
