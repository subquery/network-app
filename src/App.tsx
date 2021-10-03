import React from 'react';
import './App.css';

import { Route } from 'react-router';
import { BrowserRouter as Router, Switch } from 'react-router-dom';

import * as pages from './pages';

const App: React.VFC = () => {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route component={pages.Home} />
        </Switch>
      </Router>
    </div>
  );
};

export default App;
