// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider } from '../../containers';
import { AppSidebar } from '../../components';
import { Redirect, Route, Switch } from 'react-router';
import ServiceAgreements from './ServiceAgreements';
import { Plans } from './Plans';
import { useTranslation } from 'react-i18next';
import { BsDiagram3, BsFileEarmarkText } from 'react-icons/bs';

export const ROUTE = '/plans';
export const PLAN_ROUTE = '/plans/plans';
export const SERVICE_AGREEMENTS = '/plans/service-agreements';

const PlanAndOffer: React.VFC = () => {
  const { t } = useTranslation();
  const sidebarList = [
    {
      label: t('plans.category.myServiceAgreement'),
      link: SERVICE_AGREEMENTS,
      icon: <BsDiagram3 />,
    },
    {
      label: t('plans.category.myPlan'),
      link: PLAN_ROUTE,
      icon: <BsFileEarmarkText />,
    },
  ];

  return (
    <EraProvider>
      <AppSidebar list={sidebarList}>
        <Switch>
          <Route path={SERVICE_AGREEMENTS} component={ServiceAgreements} />
          <Route path={PLAN_ROUTE} component={Plans} />
          <Redirect from={ROUTE} to={SERVICE_AGREEMENTS} />
        </Switch>
      </AppSidebar>
    </EraProvider>
  );
};

export default PlanAndOffer;
