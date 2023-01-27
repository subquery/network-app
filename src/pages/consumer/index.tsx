// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsBookmarkDash } from 'react-icons/bs';
import { AppSidebar } from '../../components';
import { MyFlexPlans } from './MyFlexPlans';
import { FlexPlayground } from './Playground/FlexPlayground';
import { ROUTES } from '../../utils';
import { MyOffers } from './MyOffers';

const { FLEX_PLANS, MY_OFFERS, PLAYGROUND } = ROUTES;

export const Consumer: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('plans.category.myFlexPlans'),
      link: FLEX_PLANS,
      icon: <BsBookmarkDash />,
    },
    {
      label: t('plans.category.myOffers'),
      link: MY_OFFERS,
      icon: <BsBookmarkDash />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={`${FLEX_PLANS}/${PLAYGROUND}/:id`} element={<FlexPlayground />} />
        <Route path={`${FLEX_PLANS}/*`} element={<MyFlexPlans />} />
        <Route path={`${MY_OFFERS}/*`} element={<MyOffers />} />
        <Route path={'/'} element={<Navigate replace to={FLEX_PLANS} />} />
      </Routes>
    </AppSidebar>
  );
};
