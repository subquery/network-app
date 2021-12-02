// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UnsupportedChainIdError } from '@web3-react/core';
import * as React from 'react';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';
import { useWeb3 } from '../../containers';
import Create from './Create';
import Edit from './Edit';
import Home from './Home';
import Project from './Project';

const BlockchainStatus: React.FC = ({ children }) => {
  const { error } = useWeb3();

  if (error instanceof UnsupportedChainIdError) {
    return <span>Unsupported network</span>;
  }

  return <>{children}</>;
};

const Studio: React.VFC = () => {
  return (
    <BlockchainStatus>
      <Switch>
        <Route path="/studio/create" component={Create} />
        <Route path="/studio/project/edit/:id" component={Edit} />
        <Route path="/studio/project/:id" component={Project} />
        <Route exact path="/studio" component={Home} />
      </Switch>
    </BlockchainStatus>
  );
};

export default Studio;
