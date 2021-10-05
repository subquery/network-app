import * as React from 'react';
import { Route } from 'react-router';
import { Switch } from 'react-router-dom';
import Home from './Home';
import Project from './Project';

const Studio: React.VFC = () => {
  return (
    <Switch>
      <Route path="/studio/project/:id" component={Project} />
      <Route exact path="/studio" component={Home} />
    </Switch>
  );
};

export default Studio;
