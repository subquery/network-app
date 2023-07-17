// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { AppPageHeader, TabButtons } from '../../components';
import { ROUTES } from '../../utils';
import styles from './Indexers.module.css';

const { TOP_INDEXERS, ALL_INDEXERS } = ROUTES;

const buttonLinks = [
  { label: 'Top 100', link: TOP_INDEXERS },
  { label: 'All', link: ALL_INDEXERS },
];

export const Indexers: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('indexer.indexers')} desc={t('topIndexers.desc')} />
      <div>
        <div className={styles.tabList}>
          <TabButtons tabs={buttonLinks} whiteTab />
        </div>

        <Outlet></Outlet>
      </div>
    </>
  );
};

export default Indexers;
