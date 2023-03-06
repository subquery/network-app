// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EraProvider } from '../../containers';
import { Navigate, Route, Routes } from 'react-router';
import { Indexer } from './Indexer';
import { Home as Indexers } from './Indexers';
import { AppSidebar, WalletRoute } from '../../components';
import { ROUTES } from '../../utils';

const { MY_PROFILE, INDEXERS } = ROUTES;

export const Staking: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.profile'),
      link: MY_PROFILE,
    },
    {
      label: t('indexer.indexers'),
      link: INDEXERS,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Routes>
          <Route path={`${INDEXERS}/*`} element={<Indexers />} />
          <Route element={<WalletRoute element={<Indexer />} />} path={`${MY_PROFILE}/*`} />
          <Route path={`/`} element={<Navigate replace to={MY_PROFILE} />} />
        </Routes>
      </AppSidebar>
    </EraProvider>
  );
};
