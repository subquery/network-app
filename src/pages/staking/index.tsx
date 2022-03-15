// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { EraProvider, SQTokenProvider } from '../../containers';
import { Route, Switch } from 'react-router';
import { Indexer } from './Indexer';
import { Indexers } from './Indexers';
import { Home } from './Home';

const Container: React.VFC = () => {
  return (
    <EraProvider>
      <SQTokenProvider>
        <Switch>
          <Route path="/staking/indexers" component={Indexers} />
          <Route path="/staking/indexer/:address" component={Indexer} />
          <Route path="/staking" component={Home} />
        </Switch>
      </SQTokenProvider>
    </EraProvider>
  );
};

export default Container;
