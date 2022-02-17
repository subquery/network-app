// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Switch } from 'react-router';
import Home from './Home';
import Project from './Project';

const Explorer: React.VFC = () => {
  return (
    <Switch>
      <Route path="/explorer/project/:id" component={Project} />
      <Route exact path="/explorer" component={Home} />
    </Switch>
  );
};

export default Explorer;
