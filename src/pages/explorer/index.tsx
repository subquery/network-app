// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Switch } from 'react-router';
import Home from './Home';
import { Project } from './Project';

export const EXPLORER_ROUTE = '/explorer';
const PROJECT_ROUTE = '/explorer/project';

export const Explorer: React.VFC = () => {
  return (
    <Switch>
      <Route path={`${PROJECT_ROUTE}/:id`} component={Project} />
      <Route exact path={EXPLORER_ROUTE} component={Home} />
    </Switch>
  );
};
