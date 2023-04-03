// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AppSidebar } from '../../components';
import { MyFlexPlans } from './MyFlexPlans';
import { FlexPlayground } from './Playground/FlexPlayground';
import { ROUTES } from '../../utils';
import { MyOffers } from './MyOffers';
import { Marketplace } from './OfferMarketplace';
import { ServiceAgreements } from './ServiceAgreements';
import { SAPlayground } from './Playground';

const { SERVICE_AGREEMENTS, FLEX_PLANS, PLAYGROUND, MY_OFFERS, OFFER_MARKETPLACE } = ROUTES;

const isFlexPlanActive = import.meta.env.VITE_FLEXPLAN_ENABLED === 'true';

export const Consumer: React.FC = () => {
  const { t } = useTranslation();

  const FlexPlanTab = [
    {
      label: t('plans.category.myFlexPlans'),
      link: FLEX_PLANS,
    },
  ];

  const sidebarList = [
    {
      label: t('plans.category.myOffers'),
      link: MY_OFFERS,
    },
    {
      label: t('plans.category.serviceAgreement'),
      link: SERVICE_AGREEMENTS,
    },
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
    },
  ];

  const updatedSidebarList = isFlexPlanActive ? [...FlexPlanTab, ...sidebarList] : [...sidebarList];

  return (
    <AppSidebar list={updatedSidebarList}>
      <Routes>
        <Route path={`${SERVICE_AGREEMENTS}/${PLAYGROUND}/:id`} element={<SAPlayground />} />
        <Route path={`${SERVICE_AGREEMENTS}/*`} element={<ServiceAgreements USER_ROLE={'consumer'} />} />
        <Route path={`${FLEX_PLANS}/${PLAYGROUND}/:id`} element={<FlexPlayground />} />
        <Route path={`${FLEX_PLANS}/*`} element={<MyFlexPlans />} />
        <Route path={`${MY_OFFERS}/*`} element={<MyOffers />} />
        {isFlexPlanActive && <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />}
        <Route path={'/'} element={<Navigate replace to={FLEX_PLANS} />} />
      </Routes>
    </AppSidebar>
  );
};
