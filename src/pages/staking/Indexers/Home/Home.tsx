// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Home.module.css';
import { Navigate, Route, Routes } from 'react-router';
import { AppPageHeader, TabButtons } from '../../../../components';
import { TopIndexers } from '../TopIndexers';
import { AllIndexers } from '../AllIndexers';
import { Tabs } from '@subql/components';
import { DelegateIndexer } from '../DelegateIndexer';

const ALL_INDEXERS_ROUTE = `all`;
const TOP_INDEXERS_ROUTE = `top-100`;

const buttonLinks = [
  { label: 'Top 100', link: TOP_INDEXERS_ROUTE },
  { label: 'All', link: ALL_INDEXERS_ROUTE },
];

export const Home: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} />

      <div>
        <div className={styles.tabList}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>

        <Routes>
          <Route path={`delegate/:address`} element={<DelegateIndexer />} />
          <Route path={TOP_INDEXERS_ROUTE} element={<TopIndexers />} />
          <Route path={ALL_INDEXERS_ROUTE} element={<AllIndexers />} />
          <Route path={'/'} element={<Navigate replace to={TOP_INDEXERS_ROUTE} />} />
        </Routes>
      </div>
    </>
  );
};
