// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsShopWindow } from 'react-icons/bs';
import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { Marketplace } from './OfferMarketplace';

const { OFFER_MARKETPLACE } = ROUTES;

export const Indexer: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
      icon: <BsShopWindow />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Routes>
        <Route path={`${OFFER_MARKETPLACE}/*`} element={<Marketplace />} />
        <Route path={'/'} element={<Navigate replace to={OFFER_MARKETPLACE} />} />
      </Routes>
    </AppSidebar>
  );
};