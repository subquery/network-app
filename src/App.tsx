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
  QueryRegistryProjectProvider,
  UserProjectsProvider,
} from './containers';

const Providers: React.FC = ({ children }) => {
  return (
    <IPFSProvider initialState={{ gateway: process.env.REACT_APP_IPFS_GATEWAY }}>
      <QueryRegistryProjectProvider endpoint={process.env.REACT_APP_QUERY_REGISTRY_PROJECT}>
        <Web3Provider>
          <ContractsProvider>
            <ProjectMetadataProvider>
              <QueryRegistryProvider>
                <UserProjectsProvider>{children}</UserProjectsProvider>
              </QueryRegistryProvider>
            </ProjectMetadataProvider>
          </ContractsProvider>
        </Web3Provider>
      </QueryRegistryProjectProvider>
    </IPFSProvider>
  );
};

const App: React.VFC = () => {
  return (
    <Providers>
      <div className="App">
        <Router>
          <Header />
          <div className="Main">
            <Switch>
              <Route component={pages.Studio} path="/studio" />
              <Route component={pages.Explorer} path="/explorer" />
              <Route component={pages.Home} />
            </Switch>
          </div>
          <Footer />
        </Router>
      </div>
    </Providers>
  );
};

export default App;
