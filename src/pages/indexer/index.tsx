// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router';
import { Marketplace } from '@pages/consumer/OfferMarketplace';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { ServiceAgreements } from '../consumer/ServiceAgreements';
import { MyDelegators } from './MyDelegators';
import { Plans } from './MyPlans';
import { MyProjects } from './MyProjects';
import { MyStaking } from './MyStaking';

const { MY_PROJECTS, MY_PLANS, MY_STAKING, SERVICE_AGREEMENTS, OFFER_MARKETPLACE, MY_DELEGATORS } = ROUTES;

export const Indexer: React.FC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.myStaking'),
      link: MY_STAKING,
    },
    {
      label: t('myProjects.title'),
      link: MY_PROJECTS,
    },
    {
      label: t('indexer.myDelegators'),
      link: MY_DELEGATORS,
    },
    {
      label: t('plans.category.serviceAgreement'),
      link: SERVICE_AGREEMENTS,
    },
    {
      label: t('indexer.myPlans'),
      link: MY_PLANS,
    },
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={`${MY_STAKING}/*`} element={<MyStaking />} />
        <Route path={`${MY_DELEGATORS}/*`} element={<MyDelegators />} />
        <Route path={`${MY_PROJECTS}/*`} element={<MyProjects />} />
        <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />
        <Route path={`${MY_PLANS}/*`} element={<Plans />} />
        <Route path={`${SERVICE_AGREEMENTS}/*`} element={<ServiceAgreements USER_ROLE={'indexer'} />} />
        <Route path={'/'} element={<Navigate replace to={MY_STAKING} />} />
      </Routes>
    </AppSidebar>
  );
};
