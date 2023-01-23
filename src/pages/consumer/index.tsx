// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { BsBookmarkDash } from 'react-icons/bs';
import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';
import { MyFlexPlans } from './MyFlexPlans';
import { FlexPlayground } from '../plans/Playground/FlexPlayground';

export const Consumer: React.VFC = () => {
  const { t } = useTranslation();

  const sidebarList = [
    {
      label: t('plans.category.myFlexPlans'),
      link: ROUTES.FLEXPLAN_CONSUMER,
      icon: <BsBookmarkDash />,
    },
  ];

  return (
    <AppSidebar list={sidebarList}>
      <Switch>
        <Route exact path={`${ROUTES.FLEXPLAN_PLAYGROUND_CONSUMER}/:id`} component={FlexPlayground} />
        <Route path={ROUTES.FLEXPLAN_CONSUMER} component={MyFlexPlans} />
        <Redirect from={ROUTES.CONSUMER} to={ROUTES.FLEXPLAN_CONSUMER} />
      </Switch>
    </AppSidebar>
  );
};
