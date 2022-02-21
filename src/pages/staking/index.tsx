// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button, Spinner, Typography } from '@subql/react-ui';
import { EraProvider, useEra, useIndexers } from '../../containers';
import { canStartNewEra } from '../../containers/Era';
import { mapAsync, notEmpty, renderAsyncArray } from '../../utils';
import { Route, Switch, useHistory } from 'react-router';
import Indexer from './Indexer';
import Delegator from './Delegator';
import { IndexerList } from '../../components';

const Staking: React.VFC = () => {
  const { currentEra, initEra } = useEra();

  const indexers = useIndexers({});
  const history = useHistory();

  const handleClick = (indexerAddress: string) => history.push(`/staking/indexer/${indexerAddress}`);

  return (
    <div className="content-width">
      <Typography variant="h3">Era</Typography>
      {currentEra && (
        <>
          <Typography variant="h6"> Current Era</Typography>
          <Typography>{`Number: ${currentEra.index}`}</Typography>
          <Typography>{`Start time: ${currentEra.startTime.toLocaleString()}`}</Typography>
          <Typography>{`Period: ${currentEra.period}`}</Typography>

          <Button label="Start New Era" disabled={!canStartNewEra(currentEra)} onClick={initEra} />
        </>
      )}

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
