// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { MyStaking } from './MyStaking';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { Marketplace } from './OfferMarketplace';
import ServiceAgreements from '../consumer/ServiceAgreements';

const { MY_STAKING, SERVICE_AGREEMENTS, OFFER_MARKETPLACE, MY_DELEGATORS } = ROUTES;

export const Indexer: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.myStaking'),
      link: MY_STAKING,
    },
    {
      label: t('plans.category.serviceAgreement'),
      link: SERVICE_AGREEMENTS,
    },
    {
      label: t('indexer.myDelegators'),
      link: MY_DELEGATORS,
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
        <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />
        <Route path={`${SERVICE_AGREEMENTS}/*`} element={<ServiceAgreements USER_ROLE={'indexer'} />} />
        <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />
        <Route path={'/'} element={<Navigate replace to={MY_STAKING} />} />
      </Routes>
    </AppSidebar>
  );
};
