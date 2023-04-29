// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import './App.css';
import './i18n';

import { Navigate, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
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
import { t } from 'i18next';
import { AppInitProvider } from '@containers/AppInitialProvider';
import { Studio } from '@pages/studio';
import {
  SUBQL_EXPLORER,
  SUBQL_HOST_SERVICE,
  SUBQL_NETWORK_DOC,
  SUBQL_NETWORK_FORUM,
  SUBQL_NETWORK_GOVERNANCE,
} from '@utils/links';

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

const externalAppLinks = [
  {
    label: t('header.externalExplorer.title'),
    description: t('header.externalExplorer.description'),
    link: SUBQL_EXPLORER,
  },
  {
    label: t('header.managedService.title'),
    description: t('header.managedService.description'),
    link: SUBQL_HOST_SERVICE,
  },
];

const studioLink = {
  link: ROUTES.STUDIO,
  label: t('header.studio'),
};

const entryLinks = [
  {
    link: ROUTES.EXPLORER,
    label: t('header.explorer'),
  },
  {
    link: ROUTES.INDEXER,
    label: t('indexer.title'),
  },
  {
    link: ROUTES.CONSUMER,
    label: t('consumer'),
  },
  {
    link: ROUTES.DELEGATOR,
    label: t('delegator'),
  },
  {
    link: ROUTES.SWAP,
    label: t('header.swap'),
  },
  {
    link: SUBQL_NETWORK_DOC,
    label: t('header.documentation'),
  },
  {
    label: t('header.ecosystem'),
    dropdown: [
      {
        link: SUBQL_NETWORK_FORUM,
        label: t('header.forum'),
      },
      {
        link: SUBQL_NETWORK_GOVERNANCE,
        label: t('header.governance'),
      },
    ],
  },
];

const studioEnabled = import.meta.env.VITE_STUDIO_ENABLED === 'true';
const calEntryLinks = studioEnabled ? [...entryLinks, studioLink] : [...entryLinks];

export const App: React.FC = () => {
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
