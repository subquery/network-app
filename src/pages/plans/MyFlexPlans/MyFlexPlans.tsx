// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { AppPageHeader, TabButtons } from '../../../components';
import { useConsumerClosedFlexPlans, useConsumerOpenFlexPlans, useWeb3 } from '../../../containers';
import styles from './MyFlexPlans.module.css';
import { MyFlexPlanTable } from './MyFlexPlanTable';

const FLEX_PLANS = '/plans/flex-plans';
export const ONGOING_PLANS = `${FLEX_PLANS}/ongoing`;
export const EXPIRED_PLANS = `${FLEX_PLANS}/closed`;

const buttonLinks = [
  { label: 'Ongoing', link: ONGOING_PLANS },
  { label: 'Closed', link: EXPIRED_PLANS },
];

export const MyFlexPlans: React.VFC = () => {
  const { t } = useTranslation();

  const Header = () => (
    <>
      <AppPageHeader title={t('plans.category.myFlexPlans')} />
      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>
    </>
  );

  return (
    <div>
      <Header />
      <Switch>
        <Route exact path={ONGOING_PLANS} component={() => <MyFlexPlanTable queryFn={useConsumerOpenFlexPlans} />} />
        <Route exact path={EXPIRED_PLANS} component={() => <MyFlexPlanTable queryFn={useConsumerClosedFlexPlans} />} />
        <Redirect from={FLEX_PLANS} to={ONGOING_PLANS} />
      </Switch>
    </div>
  );
};
