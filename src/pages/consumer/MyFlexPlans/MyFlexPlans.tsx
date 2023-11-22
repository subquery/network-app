// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import { useIsLogin } from '@hooks/useIsLogin';
import { useGetConsumerOngoingFlexPlansLazyQuery } from '@subql/react-hooks';
import i18next from 'i18next';

import { AppPageHeader, Card, TabButtons, WalletRoute } from '../../../components';
import { useSQToken } from '../../../containers';
import { formatEther, TOKEN } from '../../../utils';
import { ROUTES } from '../../../utils';
import MyHostedPlan from './MyHostedPlan/MyHostedPlan';
import ApiKeys from './apiKeys';
import { BillingAction } from './BillingAction';
import styles from './MyFlexPlans.module.css';
import { MyFlexPlanTable } from './MyFlexPlanTable';

const { ONGOING_PLANS, API_KEY } = ROUTES;

const buttonLinks = [
  { label: i18next.t('myFlexPlans.ongoing'), link: ONGOING_PLANS },
  { label: i18next.t('myFlexPlans.apiKey'), link: API_KEY },
];

// TODO: useSQTToken update once Container improve - renovation
const BalanceCards = () => {
  const { t } = useTranslation();
  const { balance, consumerHostBalance } = useSQToken();
  const { loading: loadingBalance, data: balanceData } = balance;
  const { loading: loadingBillingBalance, data: billingBalanceData } = consumerHostBalance;
  const [billBalance] = billingBalanceData ?? [];

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
  const isLogin = useIsLogin();
  return (
    <>
      <AppPageHeader title={t('plans.category.myFlexPlans')} desc={t('myFlexPlans.description')} />
      {isLogin && (
        <>
          <BalanceCards />
          <div className={styles.tabs}>
            <TabButtons tabs={buttonLinks} whiteTab />
          </div>
        </>
      )}
    </>
  );
};

export const MyFlexPlans: React.FC = () => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header />
      <WalletRoute
        componentMode
        element={
          <Routes>
            <Route path={ONGOING_PLANS} element={<MyHostedPlan></MyHostedPlan>} />
            <Route
              path={`${ONGOING_PLANS}/details/:id`}
              element={<MyFlexPlanTable queryFn={useGetConsumerOngoingFlexPlansLazyQuery} />}
            ></Route>
            <Route path={API_KEY} element={<ApiKeys />} />
            <Route path={'/'} element={<Navigate replace to={ONGOING_PLANS} />} />
          </Routes>
        }
      ></WalletRoute>
    </div>
  );
};
