// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsCashStack, BsPerson } from 'react-icons/bs';
import { EraProvider } from '../../containers';
import { Redirect, Route, Switch } from 'react-router';
import { Indexer } from './Indexer';
import { Indexers, DelegateIndexer } from './Indexers';
import { AppSidebar } from '../../components';
import { WalletRoute } from '../../WalletRoute';

const Container: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.profile'),
      link: '/staking',
      icon: <BsPerson />,
    },
    {
      label: t('delegate.title'),
      link: `/staking/indexers`,
      icon: <BsCashStack />,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Switch>
          <Route path="/staking/indexers/delegate/:address" component={DelegateIndexer} />
          <Route path="/staking/indexers" component={Indexers} />
          <WalletRoute path="/staking/my-profile" component={Indexer} />
          <Redirect from="/staking" to="/staking/my-profile" />
        </Switch>
      </AppSidebar>
    </EraProvider>
  );
};

export default Container;
