// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider } from '../../containers';
import { ProjectSidebar } from '../../components';
import { Redirect, Route, Switch } from 'react-router';
import ServiceAgreements from './ServiceAgreements';
import { Plans } from './Plans';
import { AiOutlineBarChart } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

const ROUTE = '/plans';
const PLAN_ROUTE = '/plans/plans';
const SERVICE_AGREEMENTS = '/plans/service-agreements';

const PlanAndOffer: React.VFC = () => {
  const { t } = useTranslation();
  const sidebarList = [
    {
      label: t('plans.category.myServiceAgreement'),
      link: SERVICE_AGREEMENTS,
      icon: <AiOutlineBarChart />,
    },
    {
      label: t('plans.category.myPlan'),
      link: PLAN_ROUTE,
      icon: <AiOutlineBarChart />,
    },
  ];

  return (
    <EraProvider>
      <ProjectSidebar list={sidebarList}>
        <Switch>
          <Route path={SERVICE_AGREEMENTS} component={ServiceAgreements} />
          <Route path={PLAN_ROUTE} component={Plans} />
          <Redirect from={ROUTE} to={SERVICE_AGREEMENTS} />
        </Switch>
      </ProjectSidebar>
    </EraProvider>
  );
};

export default PlanAndOffer;
