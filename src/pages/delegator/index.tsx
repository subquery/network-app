// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route } from 'react-router';
import { Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BsPeople } from 'react-icons/bs';
import { GiBank } from 'react-icons/gi';
import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { MyDelegation } from './MyDelegation';

export const Delegator: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('delegate.delegating'),
      link: ROUTES.DELEGATOR,
      icon: <GiBank />,
    },
    {
      label: t('indexer.indexers'),
      link: ROUTES.STAKING,
      icon: <BsPeople />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Switch>
        <Route path={ROUTES.DELEGATOR} component={MyDelegation} />
        {/* <Route path={ROUTES.STAKING} component={MyDelegation} /> */}
        <Redirect from={ROUTES.DELEGATOR} to={ROUTES.DELEGATOR} />
      </Switch>
    </AppSidebar>
  );
};
