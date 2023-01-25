// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '../../components';
import { TopIndexers } from './TopIndexers';
import { AllIndexers } from './AllIndexers';
import styles from './Indexers.module.css';
import { ROUTES } from '../../utils';

const { TOP_INDEXERS, ALL_INDEXERS } = ROUTES;

const buttonLinks = [
  { label: 'Top 100', link: TOP_INDEXERS },
  { label: 'All', link: ALL_INDEXERS },
];

export const Indexers: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} desc={t('topIndexers.desc')} />
      <div>
        <div className={styles.tabList}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>
        <Routes>
          <Route index path={TOP_INDEXERS} element={<TopIndexers />} />
          <Route path={ALL_INDEXERS} element={<AllIndexers />} />
          <Route path={'/'} element={<Navigate replace to={'top'} />} />
        </Routes>
      </div>
    </>
  );
};
