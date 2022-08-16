// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';
import Create from './Create';
import Home from './Home';
import Project from './Project';

export const Studio: React.VFC = () => {
  return (
    <div className="fullWidth">
      <Switch>
        <Route path="/studio/create" component={Create} />
        <Route path="/studio/project/:id" component={Project} />
        <Route exact path="/studio" component={Home} />
      </Switch>
    </div>
  );
};
