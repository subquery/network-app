import React from 'react';
import './App.css';

import { Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import * as pages from './pages';
import { Header } from './components';
import { Web3Provider } from './containers';

const App: React.VFC = () => {
  return (
    <Web3Provider>
      <div className="App">
        <Router>
          <Header />
          <Switch>
            <Route component={pages.Home} />
          </Switch>
        </Router>
      </div>
    </Web3Provider>
  );
};

export default App;
