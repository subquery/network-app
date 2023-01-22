// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
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
      link: 'delegating',
      icon: <GiBank />,
    },
    {
      label: t('indexer.indexers'),
      link: 'indexers',
      icon: <BsPeople />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={'indexers/*'} element={<Indexers />} />
        <Route path={'delegating'} element={<MyDelegation />} />
        <Route path={'/'} element={<Navigate replace to={'delegating'} />} />
      </Routes>
    </AppSidebar>
  );
};
