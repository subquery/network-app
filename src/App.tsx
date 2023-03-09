// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import './App.css';
import './i18n';

import { Navigate, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { Explorer, Studio, Staking, Account, Indexer, Delegator, Consumer, PlanAndOffer, Swap } from './pages';
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

const Providers: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: import.meta.env.VITE_IPFS_GATEWAY }}>
      <QueryApolloProvider>
        <Web3Provider>
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
        </Web3Provider>
      </QueryApolloProvider>
    </IPFSProvider>
  );
};

const App: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Providers>
      <div className="App">
        <BrowserRouter>
          <div className="Main">
            <div className="Header">
              <Header />
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
                  <Route element={<Staking />} path={`${ROUTES.STAKING}/*`} />
                  <Route element={<WalletRoute element={<Account />} />} path={`${ROUTES.MY_ACCOUNT}/*`} />
                  <Route element={<WalletRoute element={<Indexer />} />} path={`${ROUTES.INDEXER}/*`} />
                  <Route element={<WalletRoute element={<Delegator />} />} path={`${ROUTES.DELEGATOR}/*`} />
                  <Route element={<WalletRoute element={<Consumer />} />} path={`${ROUTES.CONSUMER}/*`} />
                  <Route element={<WalletRoute element={<PlanAndOffer />} />} path={`${ROUTES.PLANS}/*`} />
                  <Route element={<WalletRoute element={<Swap />} />} path={`${ROUTES.SWAP}/*`} />
                  <Route path="/" element={<Navigate replace to={ROUTES.EXPLORER} />} />
                </Routes>
              </ChainStatus>
            </div>
          </div>
          {/* <div>
            <Footer simple />
          </div> */}
        </BrowserRouter>
      </div>
    </Providers>
  );
};

export default App;
