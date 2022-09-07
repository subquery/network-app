// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsCashStack, BsPerson } from 'react-icons/bs';
import { EraProvider } from '../../containers';
import { Redirect, Route, Switch } from 'react-router';
import { Indexer } from './Indexer';
import { Home as Indexers } from './Indexers';
import { AppSidebar } from '../../components';
import { WalletRoute } from '../../WalletRoute';
import { DelegateIndexer } from './Indexers/DelegateIndexer';

export const ROOT_ROUTE = '/staking';
export const PROFILE_ROUTE = `${ROOT_ROUTE}/my-profile`;
export const INDEXERS_ROUTE = `${ROOT_ROUTE}/indexers`;

export const Staking: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.profile'),
      link: PROFILE_ROUTE,
      icon: <BsPerson />,
    },
    {
      label: t('indexer.indexers'),
      link: INDEXERS_ROUTE,
      icon: <BsCashStack />,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Switch>
          <Route path={`${INDEXERS_ROUTE}/delegate/:address`} component={DelegateIndexer} />
          <Route path={INDEXERS_ROUTE} component={Indexers} />
          <WalletRoute path={PROFILE_ROUTE} component={Indexer} />
          <Redirect from={ROOT_ROUTE} to={PROFILE_ROUTE} />
        </Switch>
      </AppSidebar>
    </EraProvider>
  );
};
