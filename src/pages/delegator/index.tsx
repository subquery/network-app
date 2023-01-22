// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsPeople } from 'react-icons/bs';
import { GiBank } from 'react-icons/gi';
import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { MyDelegation } from './MyDelegation';
import { Indexers } from './Indexers';

export const Delegator: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('delegate.delegating'),
      link: ROUTES.DELEGATING_DELEGATOR,
      icon: <GiBank />,
    },
    {
      label: t('indexer.indexers'),
      link: ROUTES.INDEXERS_DELEGATOR,
      icon: <BsPeople />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Switch>
        <Route path={ROUTES.INDEXERS_DELEGATOR} component={Indexers} />
        <Route path={ROUTES.DELEGATING_DELEGATOR} component={MyDelegation} />
        <Redirect from={ROUTES.DELEGATOR} to={ROUTES.DELEGATING_DELEGATOR} />
      </Switch>
    </AppSidebar>
  );
};
