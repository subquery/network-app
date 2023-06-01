// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { IndexerDetails } from './IndexerDetails/IndexerDetails';
import { Indexers } from './Indexers';
import { MyDelegation } from './MyDelegation';

const { INDEXERS, INDEXER, DELEGATING } = ROUTES;

export const Delegator: React.FC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('delegate.delegating'),
      link: DELEGATING,
    },
    {
      label: t('indexer.indexers'),
      link: INDEXERS,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={`${INDEXERS}/*`} element={<Indexers />} />
        <Route path={`${INDEXER}/:id`} element={<IndexerDetails />} />
        <Route path={`${DELEGATING}`} element={<MyDelegation />} />
        <Route path={'/'} element={<Navigate replace to={DELEGATING} />} />
      </Routes>
    </AppSidebar>
  );
};
