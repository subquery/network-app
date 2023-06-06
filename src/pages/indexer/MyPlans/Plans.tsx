// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppPageHeader, TabButtons } from '@components';
import { ROUTES } from '@utils';

import { Create } from './Create';
import { Default } from './Default';
import styles from './Plans.module.css';
import Specific from './Specific';

const { DEFAULT_PLANS, SPECIFIC_PLANS } = ROUTES;

const buttonLinks = [
  { label: 'Default', link: DEFAULT_PLANS },
  { label: 'Specific', link: SPECIFIC_PLANS },
];

export const Plans: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <AppPageHeader title={t('indexer.myPlans')} desc={t('indexer.myPlansDescription')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
        <div className={styles.create}>
          <Create />
        </div>
      </div>

      <Routes>
        <Route path={DEFAULT_PLANS} element={<Default />} />
        <Route path={SPECIFIC_PLANS} element={<Specific />} />
        <Route path={'/'} element={<Navigate replace to={DEFAULT_PLANS} />} />
      </Routes>
    </div>
  );
};
