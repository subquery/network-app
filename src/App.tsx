// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren, useMemo } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { useStudioEnabled } from '@hooks';
import { Studio } from '@pages/studio';
import { entryLinks, externalAppLinks, studioLink } from '@utils/links';

import { ChainStatus, Header, WalletRoute } from './components';
import {
  IndexerRegistryProvider,
  IPFSProvider,
  ProjectMetadataProvider,
  QueryApolloProvider,
  QueryRegistryProvider,
  SQTokenProvider,
  Web3Provider,
} from './containers';
import { Account, Consumer, Delegator, Explorer, Indexer, Swap } from './pages';
import { ROUTES } from './utils';

import './App.css';
import './i18n';

// TODO: Remove SQTProvider
const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <Web3Provider>
          <AppInitProvider>
            <ProjectMetadataProvider>
              <QueryRegistryProvider>
                <IndexerRegistryProvider>
                  <SQTokenProvider>{children}</SQTokenProvider>
                </IndexerRegistryProvider>
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
            <Routes>
              <Route element={<Explorer />} path={`${ROUTES.EXPLORER}/*`} />
              {studioEnabled && <Route element={<WalletRoute element={<Studio />} />} path={`${ROUTES.STUDIO}/*`} />}
              <Route element={<WalletRoute element={<Account />} />} path={`${ROUTES.MY_ACCOUNT}/*`} />
              <Route element={<Indexer />} path={`${ROUTES.INDEXER}/*`} />
              <Route element={<Delegator />} path={`${ROUTES.DELEGATOR}/*`} />
              <Route element={<Consumer />} path={`${ROUTES.CONSUMER}/*`} />
              <Route element={<WalletRoute element={<Swap />} />} path={`${ROUTES.SWAP}/*`} />
              <Route path="/" element={<Navigate replace to={ROUTES.EXPLORER} />} />
            </Routes>
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
