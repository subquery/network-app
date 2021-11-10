// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Switch } from 'react-router';
import Home from './Home';

const Explorer: React.VFC = () => {
  return (
    <Switch>
      <Route exact path="/explorer" component={Home} />
    </Switch>
  );
};

export default Explorer;
