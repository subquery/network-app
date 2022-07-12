// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import './App.css';
import './i18n';

import { Redirect, Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import moment from 'moment';
import * as pages from './pages';
import { Header, Footer, GlobalBanner } from './components';
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
} from './containers';
import { useTranslation } from 'react-i18next';
import { NETWORK_CONFIGS } from './containers/Web3';
import { UnsupportedChainIdError } from '@web3-react/core';
// TODO move styles
import studioStyles from './pages/studio/index.module.css';
import { Button, Typography } from '@subql/react-ui';
import { WalletRoute } from './WalletRoute';
import clsx from 'clsx';
import { SEASON3 } from './pages/missions/constants';
import { DATE_FORMAT, DATE_WITH_TIME_FORMAT } from './utils';

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
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <QueryApolloProvider>
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
      </QueryApolloProvider>
    </IPFSProvider>
  );
};

const BlockchainStatus: React.FC = ({ children }) => {
  const { error } = useWeb3();
  const { t } = useTranslation();

  const isMetaMask = React.useMemo(() => !!window.ethereum?.isMetaMask, []);

  const handleSwitchNetwork = () => {
    window.ethereum?.send('wallet_addEthereumChain', [NETWORK_CONFIGS['acala-testnet']]);
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

const SEASON3_INTRO_URL = 'https://forum.subquery.network/t/introduction-for-subquery-testnet-season3/96';
const season3Duration = `Duration: ${moment(SEASON3.START).format(DATE_FORMAT)} - ${moment(SEASON3.END).format(
  DATE_WITH_TIME_FORMAT,
)} Local Time`;

const App: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <Providers>
      <div className="App">
        <Router>
          <Header />
          <GlobalBanner title={t('globalBanner.title')} subTitle={season3Duration} navigationLink={SEASON3_INTRO_URL} />
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
                <WalletRoute component={pages.Missions} path="/missions" />
                <WalletRoute component={pages.Plans} path="/plans" />
                <Redirect from="/" to="/explorer" />
              </Switch>
            </BlockchainStatus>
          </div>
          <Footer />
        </Router>
      </div>
    </Providers>
  );
};

export default App;
