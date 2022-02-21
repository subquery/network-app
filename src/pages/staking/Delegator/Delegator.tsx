// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import { IndexerList } from '../../../components';
import { useDelegations } from '../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../utils';
import { GetDelegations_delegations_nodes as Delegation } from '../../../__generated__/GetDelegations';
import { GetIndexers_indexers_nodes as Indexer } from '../../../__generated__/GetIndexers';
import Withdrawls from './Withdrawls';

function delegatorToIndexer(delegator: Delegation): Indexer {
  return {
    ...delegator,
    __typename: 'Indexer',
    id: delegator.indexerAddress,
    totalStake: delegator.amount,
    metadata: delegator.indexer?.metadata ?? null,
    controller: null,
    commission: {
      era: 0,
      value: BigNumber.from(0),
      valueAfter: BigNumber.from(0),
    },
  };
}

const Delegator: React.VFC = () => {
  const { address } = useParams<{ address: string }>();
  const history = useHistory();

  const delegations = useDelegations({ delegator: address });

  const handleDelegatorClick = (address: string) => history.push(`/staking/indexer/${address}`);

  return (
    <div className="content-width">
      <Typography variant="h5">Your delegations</Typography>

      {renderAsyncArray(
        mapAsync((data) => data.delegations?.nodes.filter(notEmpty).map(delegatorToIndexer), delegations),
        {
          error: (e) => <Typography>{`Failed to get delegations: ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography>You have no delegations. Find an indexer to start delegate to.</Typography>,
          data: (data) => <IndexerList indexers={data} onClick={handleDelegatorClick} />,
        },
      )}

      <Typography variant="h5">Your withdrawls</Typography>
      <Withdrawls delegatorAddress={address} />
    </div>
  );
};

export default Delegator;
