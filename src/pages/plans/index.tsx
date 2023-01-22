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
import { BsDiagram3, BsFileEarmarkText, BsTags, BsShopWindow, BsBookmarkDash } from 'react-icons/bs';
import { ROUTES } from '../../utils';
import { FlexPlayground } from './Playground';

<<<<<<< HEAD
const { MY_PLANS, PLAYGROUND, SERVICE_AGREEMENTS, MY_OFFERS, OFFER_MARKETPLACE, FLEX_PLANS } = ROUTES;
=======
export const PLAN_ROUTE = `my-plans`;
export const SERVICE_AGREEMENTS = `service-agreements`;
export const MY_OFFERS = `my-offers`;
export const OFFER_MARKETPLACE = `offers`;
export const FLEX_PLANS = `flex-plans`;
>>>>>>> 1776fff (update child routing for all pages)

export const PlanAndOffer: React.VFC = () => {
  const { t } = useTranslation();
  const sidebarList = [
    {
      label: t('plans.category.myServiceAgreement'),
      link: SERVICE_AGREEMENTS,
      icon: <BsDiagram3 />,
    },
    {
      label: t('plans.category.myFlexPlans'),
      link: FLEX_PLANS,
      icon: <BsBookmarkDash />,
    },
    {
      label: t('plans.category.myPlan'),
      link: MY_PLANS,
      icon: <BsFileEarmarkText />,
    },
    {
      label: t('plans.category.myOffers'),
      link: MY_OFFERS,
      icon: <BsTags />,
    },
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
      icon: <BsShopWindow />,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Routes>
          <Route path={`${SERVICE_AGREEMENTS}/*`} element={<ServiceAgreements />} />
          <Route path={`${FLEX_PLANS}/${PLAYGROUND}/:id`} element={<FlexPlayground />} />
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
