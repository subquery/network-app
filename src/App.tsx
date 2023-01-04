// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import './App.css';
import './i18n';

import { Redirect, Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';
import { UnsupportedChainIdError } from '@web3-react/core';
import clsx from 'clsx';
import { Button, Typography } from '@subql/react-ui';
import * as pages from './pages';
import { Header, Footer } from './components';
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
import { NETWORK_CONFIGS, SUPPORTED_NETWORK } from './containers/Web3';

// TODO move styles
import studioStyles from './pages/studio/index.module.css';

import { WalletRoute } from './WalletRoute';

import { getConnectorConfig } from './utils/getNetworkConnector';
import { ROUTES } from './utils';

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
  const { t } = useTranslation();
  const connectorWindowObj = getConnectorConfig(connector).windowObj;

  const isExtensionInstalled = React.useMemo(
    () => !!connectorWindowObj?.isMetaMask || !!connectorWindowObj?.isTalisman,
    [],
  );

  const handleSwitchNetwork = () => {
    connectorWindowObj?.send('wallet_addEthereumChain', [NETWORK_CONFIGS[SUPPORTED_NETWORK]]);
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

const App: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <Providers>
      <div className="App">
        <Router>
          <Header />

          <div className="Main">
            <BlockchainStatus>
              <Switch>
                <Route component={pages.Explorer} path={ROUTES.EXPLORER} />
                <WalletRoute
                  component={pages.Studio}
                  path={ROUTES.STUDIO}
                  title={t('studio.wallet.connect')}
                  subtitle={t('studio.wallet.subTitle')}
                />
                <Route component={pages.Staking} path={ROUTES.STAKING} />
                <WalletRoute component={pages.Delegator} path={ROUTES.DELEGATOR} />
                <WalletRoute component={pages.PlanAndOffer} path={ROUTES.PLANS} />
                <WalletRoute component={pages.Swap} path={ROUTES.SWAP} />
                <Redirect from="/" to={ROUTES.EXPLORER} />
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
