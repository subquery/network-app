// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsCashStack, BsPerson } from 'react-icons/bs';
import { EraProvider } from '../../containers';
import { Navigate, Route, Routes } from 'react-router';
import { Indexer } from './Indexer';
import { Home as Indexers } from './Indexers';
import { AppSidebar } from '../../components';
import { WalletRoute } from '../../WalletRoute';

export const PROFILE = `my-profile`;
export const INDEXERS = `indexers`;

export const Staking: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.profile'),
      link: PROFILE,
      icon: <BsPerson />,
    },
    {
      label: t('indexer.indexers'),
      link: INDEXERS,
      icon: <BsCashStack />,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Routes>
          <Route path={`${INDEXERS}/*`} element={<Indexers />} />
          <Route element={<WalletRoute element={Indexer} />} path={`${PROFILE}/*`} />
          <Route path={`/`} element={<Navigate replace to={PROFILE} />} />
        </Routes>
      </AppSidebar>
    </EraProvider>
  );
};
