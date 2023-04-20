// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren, useMemo } from 'react';
import './App.css';
import './i18n';

import { Navigate, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { Studio } from '@pages/studio';
import { useStudioEnabled } from '@hooks';
import { entryLinks, studioLink, externalAppLinks } from '@utils/links';

import { Explorer, Account, Indexer, Delegator, Consumer, Swap } from './pages';
import { ChainStatus, Header, WalletRoute } from './components';
import {
  Web3Provider,
  IPFSProvider,
  ProjectMetadataProvider,
  QueryRegistryProvider,
  QueryApolloProvider,
  IndexerRegistryProvider,
  SQTokenProvider,
} from './containers';
import { ROUTES } from './utils';

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

export const App: React.FC = () => {
  const studioEnabled = useStudioEnabled();
  const calEntryLinks = useMemo(() => (studioEnabled ? [...entryLinks, studioLink] : [...entryLinks]), [studioEnabled]);

  return (
    <Providers>
      <div className="App">
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
                  {studioEnabled && (
                    <Route element={<WalletRoute element={<Studio />} />} path={`${ROUTES.STUDIO}/*`} />
                  )}
                  <Route element={<WalletRoute element={<Account />} />} path={`${ROUTES.MY_ACCOUNT}/*`} />
                  <Route element={<WalletRoute element={<Indexer />} />} path={`${ROUTES.INDEXER}/*`} />
                  <Route element={<WalletRoute element={<Delegator />} />} path={`${ROUTES.DELEGATOR}/*`} />
                  <Route element={<WalletRoute element={<Consumer />} />} path={`${ROUTES.CONSUMER}/*`} />
                  <Route element={<WalletRoute element={<Swap />} />} path={`${ROUTES.SWAP}/*`} />
                  <Route path="/" element={<Navigate replace to={ROUTES.EXPLORER} />} />
                </Routes>
              </ChainStatus>
            </div>
          </div>
        </BrowserRouter>
      </div>
    </Providers>
  );
};
