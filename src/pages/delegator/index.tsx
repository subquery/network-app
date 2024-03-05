// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';

const { INDEXERS, DELEGATING } = ROUTES;

const Delegator: React.FC = () => {
  const { t } = useTranslation();
  const sidebarList = [
    {
      label: t('delegate.delegating'),
      link: DELEGATING,
    },
    {
      label: 'Node Runners',
      link: INDEXERS,
    },
  ];
  return (
    <AppSidebar list={sidebarList}>
      <Outlet></Outlet>
    </AppSidebar>
  );
};

export default Delegator;
