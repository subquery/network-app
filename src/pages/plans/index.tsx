// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider } from '../../containers';
import { AppSidebar } from '../../components';
import { Navigate, Route, Routes } from 'react-router';
import ServiceAgreements from './ServiceAgreements';
import { Plans } from './Plans';
import { Marketplace } from './OfferMarketplace';
import { MyOffers } from './MyOffers';
import { MyFlexPlans } from './MyFlexPlans';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../utils';

const { MY_PLANS, PLAYGROUND, SERVICE_AGREEMENTS, MY_OFFERS, OFFER_MARKETPLACE, FLEX_PLANS } = ROUTES;

export const PlanAndOffer: React.VFC = () => {
  const { t } = useTranslation();
  const sidebarList = [
    {
      label: t('plans.category.serviceAgreement'),
      link: SERVICE_AGREEMENTS,
    },
    {
      label: t('plans.category.myFlexPlans'),
      link: FLEX_PLANS,
    },
    {
      label: t('plans.category.myPlan'),
      link: MY_PLANS,
    },
    {
      label: t('plans.category.myOffers'),
      link: MY_OFFERS,
    },
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Routes>
          <Route path={`${SERVICE_AGREEMENTS}/*`} element={<ServiceAgreements />} />
          <Route path={`${FLEX_PLANS}/*`} element={<MyFlexPlans />} />
          <Route path={`${MY_PLANS}/*`} element={<Plans />} />
          <Route path={`${MY_OFFERS}/*`} element={<MyOffers />} />
          <Route path={OFFER_MARKETPLACE} element={<Marketplace />} />
          <Route path={'/'} element={<Navigate replace to={SERVICE_AGREEMENTS} />} />
        </Routes>
      </AppSidebar>
    </EraProvider>
  );
};
