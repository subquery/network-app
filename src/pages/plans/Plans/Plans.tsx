// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { AppPageHeader, TabButtons } from '../../../components';
import { Default } from './Default';
import { Create } from './Create';
import Specific from './Specific';
import { useTranslation } from 'react-i18next';
import styles from './Plans.module.css';

const ROUTE = '/plans/plans';
export const DEFAULT_PLANS = `${ROUTE}/default`;
export const SPECIFIC_PLANS = `${ROUTE}/specific`;

const buttonLinks = [
  { label: 'Default', link: DEFAULT_PLANS },
  { label: 'Specific', link: SPECIFIC_PLANS },
];

export const Plans: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <AppPageHeader title={t('plans.category.manageMyPlans')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
        <div className={styles.create}>
          <Create />
        </div>
      </div>

      <Switch>
        <Route exact path={DEFAULT_PLANS} component={Default} />
        <Route exact path={SPECIFIC_PLANS} component={Specific} />
        <Redirect from={ROUTE} to={DEFAULT_PLANS} />
      </Switch>
    </div>
  );
};
