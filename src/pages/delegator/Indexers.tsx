// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppPageHeader, TabButtons } from '../../components';
import { ROUTES } from '../../utils';
import { TopIndexers } from './TopIndexers';
import { AllIndexers } from './AllIndexers';
import styles from './Indexers.module.css';
import { Tabs } from '@subql/components';

const allIndexerRoute = 'all';
const topIndexerRoute = 'top';

const buttonLinks = [
  { label: 'Top 100', link: topIndexerRoute },
  { label: 'All', link: allIndexerRoute },
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
          <Route index path={'top'} element={<TopIndexers />} />
          <Route path={'all'} element={<AllIndexers />} />
          <Route path={'/'} element={<Navigate replace to={'top'} />} />
        </Routes>
      </div>
    </>
  );
};
