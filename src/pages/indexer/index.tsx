// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';

const { MY_PROJECTS, MY_PLANS, SERVICE_AGREEMENTS, OFFER_MARKETPLACE, MY_DELEGATORS } = ROUTES;

const Indexer: React.FC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('myProjects.title'),
      link: MY_PROJECTS,
    },
    {
      label: t('indexer.myDelegators'),
      link: MY_DELEGATORS,
    },
    {
      label: t('plans.category.serviceAgreement'),
      link: SERVICE_AGREEMENTS,
    },
    {
      label: t('indexer.myPlans'),
      link: MY_PLANS,
    },
    {
      label: t('plans.category.offerMarketplace'),
      link: OFFER_MARKETPLACE,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Outlet></Outlet>
    </AppSidebar>
  );
};

export default Indexer;
