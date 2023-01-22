// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { useGetConsumerOngoingFlexPlansQuery, useGetConsumerClosedFlexPlansQuery } from '@subql/react-hooks';
import { AppPageHeader, Card, TabButtons } from '../../../components';
import { useSQToken } from '../../../containers';
import { formatEther, ROUTES, TOKEN } from '../../../utils';
import { MyFlexPlanTable } from './MyFlexPlanTable';
import styles from './MyFlexPlans.module.css';
import { BillingAction } from './BillingAction';
import i18next from 'i18next';

const FLEX_PLANS = ROUTES.FLEXPLAN_CONSUMER;
export const ONGOING_PLANS = ROUTES.ONGOING_FLEXPLAN_CONSUMER;
export const EXPIRED_PLANS = ROUTES.CLOSED_FLEXPLAN_CONSUMER;

const buttonLinks = [
  { label: i18next.t('myFlexPlans.ongoing'), link: ONGOING_PLANS },
  { label: i18next.t('myFlexPlans.closed'), link: EXPIRED_PLANS },
];

// TODO: useSQTToken update once Container improve - renovation
const BalanceCards = () => {
  const { t } = useTranslation();
  const { balance, consumerHostBalance } = useSQToken();
  const { loading: loadingBalance, data: balanceData } = balance;
  const { loading: loadingBillingBalance, data: billingBalanceData } = consumerHostBalance;
  const [billBalance] = billingBalanceData ?? [];

  // TODO: confirm whether need this part
  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     balance.refetch();
  //     consumerHostBalance.refetch();

  //   }, 15000);
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <div className={styles.cards}>
      <div className={styles.balances}>
        <Card
          title={t('flexPlans.billBalance').toUpperCase()}
          value={!balanceData && loadingBillingBalance ? '-' : `${formatEther(billBalance, 4)} ${TOKEN}`}
          action={<BillingAction />}
        />
        <Card
          title={t('flexPlans.walletBalance')}
          value={!loadingBillingBalance && loadingBalance ? '-' : `${formatEther(balanceData, 4)} ${TOKEN}`}
        />
      </div>
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('plans.category.myFlexPlans')} desc={t('myFlexPlans.description')} />
      <BalanceCards />
      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
      </div>
    </>
  );
};

export const MyFlexPlans: React.VFC = () => {
  return (
    <div>
      <Header />
      <Switch>
        <Route
          exact
          path={ONGOING_PLANS}
          component={() => <MyFlexPlanTable queryFn={useGetConsumerOngoingFlexPlansQuery} />}
        />
        <Route
          exact
          path={EXPIRED_PLANS}
          component={() => <MyFlexPlanTable queryFn={useGetConsumerClosedFlexPlansQuery} />}
        />
        <Redirect from={FLEX_PLANS} to={ONGOING_PLANS} />
      </Switch>
    </div>
  );
};
