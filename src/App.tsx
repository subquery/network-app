// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import './App.css';
import './i18n';

import { Navigate, Route, Routes } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import { UnsupportedChainIdError } from '@web3-react/core';
import clsx from 'clsx';
import { Button, Typography } from '@subql/react-ui';
import * as pages from './pages';
import { Header } from './components';
import {
  Web3Provider,
  IPFSProvider,
  ProjectMetadataProvider,
  QueryRegistryProvider,
  ContractsProvider,
  QueryApolloProvider,
  UserProjectsProvider,
  IndexerRegistryProvider,
  useWeb3,
  SQTokenProvider,
  EraProvider,
} from './containers';
import { useTranslation } from 'react-i18next';

// TODO move styles
import studioStyles from './pages/studio/index.module.css';

import { WalletRoute } from './WalletRoute';

import { getConnectorConfig } from './utils/getNetworkConnector';
import { ROUTES } from './utils';
import { networks } from '@subql/contract-sdk';

const ErrorFallback = ({ error, componentStack, resetError }: any) => {
  return (
    <div className={clsx('fullWidth', 'col-flex', 'flex-center', 'content-width')}>
      <Typography className={'errorText'}>Something went wrong:</Typography>
      <Typography className="errorText">{error?.message || error.toString()}</Typography>
      <Typography>{componentStack}</Typography>
      <Button size="large" onClick={resetError} colorScheme="gradient" label="Try again" />
    </div>
  );
};

const Providers: React.FC = ({ children }) => {
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

const BlockchainStatus: React.FC = ({ children }) => {
  const { error, connector } = useWeb3();
  const { t } = useTranslation('translation');
  const connectorWindowObj = getConnectorConfig(connector).windowObj;

  const isExtensionInstalled = React.useMemo(
    () => !!connectorWindowObj?.isMetaMask || !!connectorWindowObj?.isTalisman,
    [],
  );

  // TODO: should switch specific network basing on the current env: `dev` | `kepler` | `mainnet`
  const handleSwitchNetwork = () => {
    connectorWindowObj?.send('wallet_addEthereumChain', networks.testnet);
  };

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className={['content-width', studioStyles.networkContainer].join(' ')}>
        <p className={studioStyles.networkTitle}>{t('unsupportedNetwork.title')}</p>
        <p className={studioStyles.networkSubtitle}>{t('unsupportedNetwork.subtitle')}</p>
        {isExtensionInstalled && (
          <Button label={t('unsupportedNetwork.button')} type="primary" onClick={handleSwitchNetwork} />
        )}
      </div>
    );
  }

  return <>{children}</>;
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
              <BlockchainStatus>
                <Routes>
                  <Route element={<pages.Explorer />} path={`${ROUTES.EXPLORER}/*`} />
                  <Route
                    element={
                      <WalletRoute
                        element={pages.Studio}
                        title={t('studio.wallet.connect')}
                        subtitle={t('studio.wallet.subTitle')}
                      />
                    }
                    path={`${ROUTES.STUDIO}/*`}
                  />
                  <Route element={<pages.Staking />} path={`${ROUTES.STAKING}/*`} />
                  <Route element={<WalletRoute element={pages.Account} />} path={`${ROUTES.MY_ACCOUNT}/*`} />
                  <Route element={<WalletRoute element={pages.Indexer} />} path={`${ROUTES.INDEXER}/*`} />
                  <Route element={<WalletRoute element={pages.Delegator} />} path={`${ROUTES.DELEGATOR}/*`} />
                  <Route element={<WalletRoute element={pages.Consumer} />} path={`${ROUTES.CONSUMER}/*`} />
                  <Route element={<WalletRoute element={pages.PlanAndOffer} />} path={`${ROUTES.PLANS}/*`} />
                  <Route element={<WalletRoute element={pages.Swap} />} path={`${ROUTES.SWAP}/*`} />
                  <Route path="/" element={<Navigate replace to={ROUTES.EXPLORER} />} />
                </Routes>
              </BlockchainStatus>
            </div>
          </div>
          {/* <Footer /> */}
        </BrowserRouter>
      </div>
    </Providers>
  );
};

export default App;
