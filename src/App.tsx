// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import './App.css';
import './i18n';

import { Redirect, Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import * as pages from './pages';
import { Header, Footer } from './components';
import {
  Web3Provider,
  IPFSProvider,
  ProjectMetadataProvider,
  QueryRegistryProvider,
  ContractsProvider,
  QueryRegistryProjectProvider,
  UserProjectsProvider,
  IndexerRegistryProvider,
  useWeb3,
  SQTokenProvider,
} from './containers';
import { useTranslation } from 'react-i18next';
import { NETWORK_CONFIGS } from './containers/Web3';
import { UnsupportedChainIdError } from '@web3-react/core';
// TODO move styles
import studioStyles from './pages/studio/index.module.css';
import { Button, Typography } from '@subql/react-ui';
import { WalletRoute } from './WalletRoute';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div role="alert">
      <Typography className="errorText">Something went wrong:</Typography>
      <Typography className="errorText">{error.message}</Typography>
      <Button onClick={resetErrorBoundary}>Try again</Button>
    </div>
  );
};

const Providers: React.FC = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <QueryRegistryProjectProvider endpoint={process.env.REACT_APP_QUERY_REGISTRY_PROJECT}>
        <Web3Provider>
          <ContractsProvider>
            <ProjectMetadataProvider>
              <QueryRegistryProvider>
                <IndexerRegistryProvider>
                  <SQTokenProvider>
                    <UserProjectsProvider>{children}</UserProjectsProvider>
                  </SQTokenProvider>
                </IndexerRegistryProvider>
              </QueryRegistryProvider>
            </ProjectMetadataProvider>
          </ContractsProvider>
        </Web3Provider>
      </QueryRegistryProjectProvider>
    </IPFSProvider>
  );
};

const BlockchainStatus: React.FC = ({ children }) => {
  const { error } = useWeb3();
  const { t } = useTranslation();

  const isMetaMask = React.useMemo(() => !!window.ethereum?.isMetaMask, []);

  const handleSwitchNetwork = () => {
    window.ethereum?.send('wallet_addEthereumChain', [NETWORK_CONFIGS['sqn-testnet']]);
  };

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className={['content-width', studioStyles.networkContainer].join(' ')}>
        <p className={studioStyles.networkTitle}>{t('unsupportedNetwork.title')}</p>
        <p className={studioStyles.networkSubtitle}>{t('unsupportedNetwork.subtitle')}</p>
        {isMetaMask && <Button label={t('unsupportedNetwork.button')} type="primary" onClick={handleSwitchNetwork} />}
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Providers>
        <div className="App">
          <Router>
            <Header />
            <div className="Main">
              <BlockchainStatus>
                <Switch>
                  <Route component={pages.Explorer} path="/explorer" />
                  <WalletRoute
                    component={pages.Studio}
                    path="/studio"
                    title={t('studio.wallet.connect')}
                    subtitle={t('studio.wallet.subTitle')}
                  />
                  <Route component={pages.Staking} path="/staking" />
                  <WalletRoute component={pages.Plans} path="/plans" />
                  {/*{<Route component={pages.Home} />}*/}
                  <Redirect from="/" to="/explorer" />
                </Switch>
              </BlockchainStatus>
            </div>
            <Footer />
          </Router>
        </div>
      </Providers>
    </ErrorBoundary>
  );
};

export default App;
