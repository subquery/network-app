// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsPerson, BsShopWindow } from 'react-icons/bs';
import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { Marketplace } from './OfferMarketplace';
import { MyStaking } from './MyStaking';

const { OFFER_MARKETPLACE, MY_STAKING } = ROUTES;

export const Indexer: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('indexer.myStaking'),
      link: MY_STAKING,
      icon: <BsPerson />,
    },
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
      icon: <BsShopWindow />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={`${MY_STAKING}/*`} element={<MyStaking />} />
        <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />
        <Route path={'/'} element={<Navigate replace to={MY_STAKING} />} />
      </Routes>
    </AppSidebar>
  );
};
