// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import clsx from 'clsx';
import * as React from 'react';
import { NavLink, Redirect, Route, Switch } from 'react-router-dom';
import { CurEra } from '../../../components';
import styles from './Plans.module.css';
import Default from './Default';

const ROUTE = '/plans/plans';

const Plans: React.VFC = () => {
  return (
    <div>
      <div className={styles.header}>
        <Typography variant="h4" className={clsx(styles.title, styles.grayText)}>
          {'Manage My Plans'}
        </Typography>

        <CurEra />
      </div>
      <div className="tabContainer">
        <NavLink to={`${ROUTE}/default`} className={(isActive) => clsx('tab', isActive && 'tabSelected')} replace>
          <Typography>{'Default'}</Typography>
        </NavLink>
        <NavLink to={`${ROUTE}/specific`} className={(isActive) => clsx('tab', isActive && 'tabSelected')} replace>
          <Typography>{'Specific'}</Typography>
        </NavLink>
      </div>
      <div className="content-width">
        <Switch>
          <Route exact path={`${ROUTE}/default`} component={Default} />
          <Route exact path={`${ROUTE}/specific`} render={() => <>SPECIFIC</>} />
          <Redirect from={ROUTE} to={`${ROUTE}/default`} />
        </Switch>
      </div>
    </div>
  );
};

export default Plans;
