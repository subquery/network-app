// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Home.module.css';
import { Navigate, Route, Routes } from 'react-router';
import { AppPageHeader, Tabs } from '../../../../components';
import { TopIndexers } from '../TopIndexers';
import { AllIndexers } from '../AllIndexers';
import { DelegateIndexer } from '../DelegateIndexer';
import { ROUTES } from '../../../../utils';

const { DELEGATE, TOP_INDEXERS, ALL_INDEXERS } = ROUTES;

const buttonLinks = [
  { label: 'Top 100', link: TOP_INDEXERS },
  { label: 'All', link: ALL_INDEXERS },
];

export const Home: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} />

      <div>
        <div className={styles.tabList}>
          <Tabs tabs={buttonLinks} />
        </div>

        <Routes>
          <Route path={`${DELEGATE}/:address`} element={<DelegateIndexer />} />
          <Route path={TOP_INDEXERS} element={<TopIndexers />} />
          <Route path={ALL_INDEXERS} element={<AllIndexers />} />
          <Route path={'/'} element={<Navigate replace to={TOP_INDEXERS} />} />
        </Routes>
      </div>
    </>
  );
};
