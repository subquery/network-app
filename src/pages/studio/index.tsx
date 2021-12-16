// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UnsupportedChainIdError } from '@web3-react/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';
import { Button } from '@subql/react-ui';
import { useWeb3 } from '../../containers';
import { NETWORK_CONFIGS } from '../../containers/Web3';
import Create from './Create';
import Home from './Home';
import Project from './Project';
import styles from './index.module.css';

const BlockchainStatus: React.FC = ({ children }) => {
  const { error } = useWeb3();
  const { t } = useTranslation();

  const isMetaMask = React.useMemo(() => !!window.ethereum?.isMetaMask, []);

  const handleSwitchNetwork = () => {
    window.ethereum?.send('wallet_addEthereumChain', [NETWORK_CONFIGS['moonbase-alpha']]);
  };

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className={['content-width', styles.networkContainer].join(' ')}>
        <p className={styles.networkTitle}>{t('unsupportedNetwork.title')}</p>
        <p className={styles.networkSubtitle}>{t('unsupportedNetwork.subtitle')}</p>
        {isMetaMask && <Button label={t('unsupportedNetwork.button')} type="primary" onClick={handleSwitchNetwork} />}
      </div>
    );
  }

  return <>{children}</>;
};

const Studio: React.VFC = () => {
  return (
    <BlockchainStatus>
      <Switch>
        <Route path="/studio/create" component={Create} />
        <Route path="/studio/project/:id" component={Project} />
        <Route exact path="/studio" component={Home} />
      </Switch>
    </BlockchainStatus>
  );
};

export default Studio;
