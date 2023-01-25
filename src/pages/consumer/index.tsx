// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsBookmarkDash } from 'react-icons/bs';
import { AppSidebar } from '../../components';
import { MyFlexPlans } from './MyFlexPlans';
import { FlexPlayground } from '../plans/Playground/FlexPlayground';
import { ROUTES } from '../../utils';

const { FLEX_PLANS, PLAYGROUND } = ROUTES;

export const Consumer: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('plans.category.myFlexPlans'),
      link: FLEX_PLANS,
      icon: <BsBookmarkDash />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={`${FLEX_PLANS}/${PLAYGROUND}/:id`} element={<FlexPlayground />} />
        <Route path={`${FLEX_PLANS}/*`} element={<MyFlexPlans />} />
        <Route path={'/'} element={<Navigate replace to={'flex-plans'} />} />
      </Routes>
    </AppSidebar>
  );
};
