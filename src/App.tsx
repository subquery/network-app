// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import './App.css';
import './i18n';

import { Navigate, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { Explorer, Studio, Account, Indexer, Delegator, Consumer, Swap } from './pages';
import { ChainStatus, Header, WalletRoute } from './components';
import {
  Web3Provider,
  IPFSProvider,
  ProjectMetadataProvider,
  QueryRegistryProvider,
  ContractsProvider,
  QueryApolloProvider,
  UserProjectsProvider,
  IndexerRegistryProvider,
  SQTokenProvider,
  EraProvider,
} from './containers';
import { useTranslation } from 'react-i18next';
import { ROUTES } from './utils';
import { t } from 'i18next';
import { AppInitProvider } from '@containers/AppInitialProvider';

// TODO: Remove ContractProvider, ERAProvider, SQTProvider
const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <Web3Provider>
          <AppInitProvider>
            <ContractsProvider>
              <ProjectMetadataProvider>
                <QueryRegistryProvider>
                  <IndexerRegistryProvider>
                    <EraProvider>
                      <SQTokenProvider>
                        <UserProjectsProvider>{children}</UserProjectsProvider>
                      </SQTokenProvider>
                    </EraProvider>
                  </IndexerRegistryProvider>
                </QueryRegistryProvider>
              </ProjectMetadataProvider>
            </ContractsProvider>
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
    link: 'https://explorer.subquery.network/',
  },
  {
    label: t('header.managedService.title'),
    description: t('header.managedService.description'),
    link: 'https://managedservice.subquery.network/',
  },
];

const entryLinks = [
  {
    link: ROUTES.EXPLORER,
    label: t('header.explorer'),
  },
  // {
  //   link: ROUTES.STUDIO,
  //   label: t('header.studio'),
  // },
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
    link: 'https://academy.subquery.network/subquery_network/testnet/welcome.html',
    label: t('header.documentation'),
  },
  {
    label: t('header.ecosystem'),
    dropdown: [
      {
        link: 'https://forum.subquery.network/c/season-3/6',
        label: t('header.forum'),
      },
      {
        link: 'https://snapshot.org/#/subquerynetwork.eth',
        label: t('header.governance'),
      },
    ],
  },
];

export const App: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Providers>
      <div className="App">
        <BrowserRouter>
          <div className="Main">
            <div className="Header">
              {/* TODO: replace with component from ui library */}
              <Header appNavigation={entryLinks} dropdownLinks={{ label: 'Kepler', links: externalAppLinks }} />
            </div>

            <div className="Content">
              <ChainStatus>
                <Routes>
                  <Route element={<Explorer />} path={`${ROUTES.EXPLORER}/*`} />
                  <Route
                    element={
                      <WalletRoute
                        element={<Studio />}
                        title={t('studio.wallet.connect')}
                        subtitle={t('studio.wallet.subTitle')}
                      />
                    }
                    path={`${ROUTES.STUDIO}/*`}
                  />
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
