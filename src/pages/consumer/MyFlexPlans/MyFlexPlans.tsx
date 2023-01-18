// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch } from 'react-router';
import { AppPageHeader, Card, TabButtons } from '../../../components';
import { useConsumerClosedFlexPlans, useConsumerOpenFlexPlans, useSQToken } from '../../../containers';
import { formatEther, ROUTES, TOKEN } from '../../../utils';
import { MyFlexPlanTable } from './MyFlexPlanTable';
import styles from './MyFlexPlans.module.css';
import { BillingAction } from './BillingAction';

const FLEX_PLANS = ROUTES.FLEXPLAN_CONSUMER;
export const ONGOING_PLANS = ROUTES.ONGOING_FLEXPLAN_CONSUMER;
export const EXPIRED_PLANS = ROUTES.CLOSED_FLEXPLAN_CONSUMER;

const buttonLinks = [
  { label: 'Ongoing', link: ONGOING_PLANS },
  { label: 'Closed', link: EXPIRED_PLANS },
];

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
      <AppPageHeader title={t('consumer')} />
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
        <Route exact path={ONGOING_PLANS} component={() => <MyFlexPlanTable queryFn={useConsumerOpenFlexPlans} />} />
        <Route exact path={EXPIRED_PLANS} component={() => <MyFlexPlanTable queryFn={useConsumerClosedFlexPlans} />} />
        <Redirect from={FLEX_PLANS} to={ONGOING_PLANS} />
      </Switch>
    </div>
  );
};
