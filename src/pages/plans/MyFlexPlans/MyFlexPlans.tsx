// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import { AppPageHeader, Card, TabButtons } from '../../../components';
import { useConsumerClosedFlexPlans, useConsumerOpenFlexPlans, useSQToken } from '../../../containers';
import { formatEther, ROUTES, TOKEN } from '../../../utils';
import { MyFlexPlanTable } from './MyFlexPlanTable';
import styles from './MyFlexPlans.module.css';
import { BillingAction } from './BillingAction';

const { ONGOING_PLANS, PLAYGROUND, EXPIRED_PLANS } = ROUTES;

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
          className={styles.SCard}
        />
        <Card
          title={t('flexPlans.walletBalance')}
          value={!loadingBillingBalance && loadingBalance ? '-' : `${formatEther(balanceData, 4)} ${TOKEN}`}
          className={styles.SCard}
        />
      </div>
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('plans.category.myFlexPlans')} />
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
      <Routes>
        <Route path={ONGOING_PLANS} element={<MyFlexPlanTable queryFn={useConsumerOpenFlexPlans} />} />
        <Route path={EXPIRED_PLANS} element={<MyFlexPlanTable queryFn={useConsumerClosedFlexPlans} />} />
        <Route path={'/'} element={<Navigate replace to={ONGOING_PLANS} />} />
      </Routes>
    </div>
  );
};
