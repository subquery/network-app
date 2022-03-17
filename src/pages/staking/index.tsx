// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider, SQTokenProvider } from '../../containers';
import { Route, Switch } from 'react-router';
import { Indexer } from './Indexer';
import { Indexers, DelegateIndexer } from './Indexers';
import { Home } from './Home';
import { useTranslation } from 'react-i18next';
import { AiOutlineBarChart } from 'react-icons/ai';
import { Sidebar } from '../../components';
import styles from './index.module.css';

const Container: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.profile'),
      link: '/staking',
      icon: <AiOutlineBarChart />,
      // activeStyle: activeNavLink('indexer/'),
    },
    {
      label: t('delegate.title'),
      link: `/staking/indexers`,
      icon: <AiOutlineBarChart />,
      // activeStyle: activeNavLink(`indexers`),
    },
  ];

  return (
    <EraProvider>
      <SQTokenProvider>
        <div className={styles.container}>
          <div className={styles.sidebar}>
            <Sidebar list={sidebarList} />
          </div>
          <div className={styles.content}>
            <Switch>
              <Route path="/staking/indexers/delegate/:address" component={DelegateIndexer} />
              <Route path="/staking/indexers" component={Indexers} />
              <Route path="/staking/indexer/:address" component={Indexer} />
              <Route path="/staking" component={Home} />
            </Switch>
          </div>
        </div>
      </SQTokenProvider>
    </EraProvider>
  );
};

export default Container;
