// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetConsumerOngoingFlexPlansQuery, useGetConsumerClosedFlexPlansQuery } from '@subql/react-hooks';
import { Navigate, Route, Routes } from 'react-router';
import { AppPageHeader, Card, TabButtons } from '../../../components';
import { useSQToken } from '../../../containers';
import { formatEther, TOKEN } from '../../../utils';
import { MyFlexPlanTable } from './MyFlexPlanTable';
import styles from './MyFlexPlans.module.css';
import { BillingAction } from './BillingAction';
import i18next from 'i18next';
import { ROUTES } from '../../../utils';

const { ONGOING_PLANS, EXPIRED_PLANS } = ROUTES;

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
      <Routes>
        <Route path={ONGOING_PLANS} element={<MyFlexPlanTable queryFn={useGetConsumerOngoingFlexPlansQuery} />} />
        <Route path={EXPIRED_PLANS} element={<MyFlexPlanTable queryFn={useGetConsumerClosedFlexPlansQuery} />} />
        <Route path={'/'} element={<Navigate replace to={ONGOING_PLANS} />} />
      </Routes>
    </div>
  );
};
