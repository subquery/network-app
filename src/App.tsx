// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import './App.css';
import './i18n';

import { Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import * as pages from './pages';
import { Header, Footer } from './components';
import {
  Web3Provider,
  IPFSProvider,
  ProjectMetadataProvider,
  QueryRegistryProvider,
  ContractsProvider,
} from './containers';
import { SubqueryNetwork } from '@subql/contract-sdk/types';

const App: React.VFC = () => {
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <Web3Provider>
        <ContractsProvider
          initialState={{
            network: process.env.REACT_APP_BLOCKCHAIN_ENV as SubqueryNetwork | undefined,
            endpoint: process.env.REACT_APP_BLOCKCHAIN_GATEWAY,
          }}
        >
          <ProjectMetadataProvider>
            <QueryRegistryProvider>
              <div className="App">
                <Router>
                  <Header />
                  <Switch>
                    <Route component={pages.Studio} path="/studio" />
                    <Route component={pages.Home} />
                  </Switch>
                  <Footer />
                </Router>
              </div>
            </QueryRegistryProvider>
          </ProjectMetadataProvider>
        </ContractsProvider>
      </Web3Provider>
    </IPFSProvider>
  );
};

export default App;
