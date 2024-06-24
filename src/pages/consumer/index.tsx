// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ConsumerSidebar } from '@utils/links';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import MyBoostedProjects from './MyBoostedProjects/MyBoostedProjects';
import { FlexPlayground } from './Playground/FlexPlayground';
import { MyFlexPlans } from './MyFlexPlans';
import { MyOffers } from './MyOffers';
import { Marketplace } from './OfferMarketplace';
import { SAPlayground } from './Playground';
import { ServiceAgreements } from './ServiceAgreements';

const { SERVICE_AGREEMENTS, FLEX_PLANS, PLAYGROUND, MY_OFFERS, OFFER_MARKETPLACE } = ROUTES;

const isFlexPlanActive = true;

const Consumer: React.FC = () => {
  return (
    <AppSidebar list={ConsumerSidebar}>
      <Routes>
        <Route path={`${SERVICE_AGREEMENTS}/${PLAYGROUND}/:id`} element={<SAPlayground />} />
        <Route path={`${SERVICE_AGREEMENTS}/*`} element={<ServiceAgreements USER_ROLE={'consumer'} />} />
        <Route
          path={`${FLEX_PLANS}/${PLAYGROUND}/:id`}
          element={isFlexPlanActive ? <FlexPlayground /> : <Navigate replace to={'/'} />}
        />
        <Route path={`boosted-projects/*`} element={<MyBoostedProjects></MyBoostedProjects>} />
        <Route path={`${FLEX_PLANS}/*`} element={isFlexPlanActive ? <MyFlexPlans /> : <Navigate replace to={'/'} />} />
        <Route path={`${MY_OFFERS}/*`} element={<MyOffers />} />
        <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />

        <Route path={'/'} element={<Navigate replace to={isFlexPlanActive ? FLEX_PLANS : MY_OFFERS} />} />
      </Routes>
    </AppSidebar>
  );
};

export default Consumer;
