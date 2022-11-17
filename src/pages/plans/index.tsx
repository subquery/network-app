// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider } from '../../containers';
import { AppSidebar } from '../../components';
import { Redirect, Route, Switch } from 'react-router';
import ServiceAgreements from './ServiceAgreements';
import { Plans } from './Plans';
import { Marketplace } from './OfferMarketplace';
import { MyOffers } from './MyOffers';
import { MyFlexPlans } from './MyFlexPlans';
import { useTranslation } from 'react-i18next';
import { BsDiagram3, BsFileEarmarkText, BsTags, BsShopWindow, BsBookmarkDash } from 'react-icons/bs';

export const ROUTE = '/plans';
export const PLAN_ROUTE = `${ROUTE}/my-plans`;
export const SERVICE_AGREEMENTS = `${ROUTE}/service-agreements`;
export const MY_OFFERS = `${ROUTE}/my-offers`;
export const OFFER_MARKETPLACE = `${ROUTE}/offers`;
export const FLEX_PLANS = `${ROUTE}/flex-plans`;

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
      link: PLAN_ROUTE,
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
        <Switch>
          <Route path={SERVICE_AGREEMENTS} component={ServiceAgreements} />
          <Route path={FLEX_PLANS} component={MyFlexPlans} />
          <Route path={PLAN_ROUTE} component={Plans} />
          <Route path={OFFER_MARKETPLACE} component={Marketplace} />
          <Route path={MY_OFFERS} component={MyOffers} />
          <Redirect from={ROUTE} to={SERVICE_AGREEMENTS} />
        </Switch>
      </AppSidebar>
    </EraProvider>
  );
};
