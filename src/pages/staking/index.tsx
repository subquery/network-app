// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button, Spinner, Typography } from '@subql/react-ui';
import { EraProvider, useEra, useIndexers } from '../../containers';
import { canStartNewEra } from '../../containers/Era';
import { mapAsync, notEmpty, renderAsync, renderAsyncArray } from '../../utils';
import { Route, Switch, useHistory } from 'react-router';
import { NavLink, Link } from 'react-router-dom';
import Indexer from './Indexer';
import Delegator from './Delegator';
import { IndexerList } from '../../components';
import styles from './index.module.css';

const Staking: React.VFC = () => {
  const { currentEra, initEra } = useEra();

  const indexers = useIndexers({});
  const history = useHistory();

  const handleClick = (indexerAddress: string) => history.push(`/staking/indexer/${indexerAddress}`);
  console.log('currentEra', currentEra);
  console.log('initEra', initEra);
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <NavLink className={styles.navLink} to={''}>
          My profile
        </NavLink>
        <NavLink className={styles.navLink} to={''}>
          Delegate
        </NavLink>
      </div>
      <div className={styles.stakingDetails}>
        <Typography variant="h3">Era</Typography>
        {renderAsync(currentEra, {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Failed to load era: ${e.message}`}</Typography>,
          data: (era) => {
            console.log('era', era);
            if (!era) return null;
            return (
              <>
                <Typography variant="h6"> Current Era</Typography>
                <Typography>{`Number: ${era.index}`}</Typography>
                <Typography>{`Start time: ${era.startTime.toLocaleString()}`}</Typography>
                <Typography>{`Period: ${era.period}`}</Typography>

                <Button label="Start New Era" disabled={!canStartNewEra(era)} onClick={initEra} />
              </>
            );
          },
        })}

        <Typography variant="h3">Indexers</Typography>

        {renderAsyncArray(
          mapAsync((data) => data.indexers?.nodes.filter(notEmpty), indexers),
          {
            error: (e) => <Typography>{`Failed to load indexers: ${e.message}`}</Typography>,
            loading: () => <Spinner />,
            data: (data) => <IndexerList indexers={data} onClick={handleClick} />,
            empty: () => <Typography>No indexers</Typography>,
          },
        )}
      </div>
    </div>
  );
};

const Container: React.VFC = () => {
  return (
    <EraProvider>
      <Switch>
        <Route path="/staking/indexer/:address" component={Indexer} />
        <Route path="/staking/delegator/:address" component={Delegator} />
        <Route path="/staking" component={Staking} />
      </Switch>
    </EraProvider>
  );
};

export default Container;
