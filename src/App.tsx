// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import './App.css';
import './i18n';

import { Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import * as pages from './pages';
import { Header } from './components';
import { Web3Provider, IPFSProvider, ProjectMetadataProvider } from './containers';

const App: React.VFC = () => {
  return (
    <IPFSProvider initialState={{ gateway: 'http://localhost:5001/api/v0' }}>
      <ProjectMetadataProvider>
        <Web3Provider>
          <div className="App">
            <Router>
              <Header />
              <Switch>
                <Route component={pages.Studio} path="/studio" />
                <Route component={pages.Home} />
              </Switch>
            </Router>
          </div>
        </Web3Provider>
      </ProjectMetadataProvider>
    </IPFSProvider>
  );
};

export default App;
