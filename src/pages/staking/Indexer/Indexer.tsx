// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from 'ethers';
import { Spinner, Typography } from '@subql/react-ui';

import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import { useIndexer, useIndexerDelegators } from '../../../containers';
import { mapAsync, notEmpty, renderAsyncArray, renderAsync } from '../../../utils';
import { GetIndexer_indexer as Indexer } from '../../../__generated__/GetIndexer';
import { DelegatorsList } from '../../../components';
import Commission from './Commission';
import OwnDelegation from './OwnDelegation';

const Header: React.FC<{ indexer: Indexer }> = (props) => {
  return null;
};

const IndexerDetails: React.VFC = () => {
  const { address } = useParams<{ address: string }>();
  const history = useHistory();

  const asyncIndexer = useIndexer({ address });
  const delegators = useIndexerDelegators({ id: address });

  const handleDelegatorClick = (delegatorAddress: string) => history.push(`/staking/delegator/${delegatorAddress}`);

  return (
    <div className="content-width">
      {renderAsync(asyncIndexer, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Unable to load indexer: ${e.message}`}</Typography>,
        data: (data) => {
          // if (!data?.indexer) {
          //   return <Typography>Indexer not found.</Typography>;
          // }

          return (
            <div>
              {/*<Header indexer={data.indexer}/>*/}

              <Typography variant="h5">Delegators</Typography>
              {/* Placeholder data */}
              <DelegatorsList
                onClick={handleDelegatorClick}
                delegators={[
                  {
                    __typename: 'Delegation',
                    delegatorAddress: '0x759Dc965026Ea8D6919451c0B1eaD337bD60ddeD',
                    amount: {
                      era: 2,
                      value: BigNumber.from(0),
                      valueAfter: BigNumber.from('1001000000000000000000'),
                    },
                  },
                ]}
              />
              {renderAsyncArray(
                mapAsync((data) => data.indexer?.delegations.nodes.filter(notEmpty), delegators),
                {
                  error: (e) => <Typography>{`Failed to get project delegators`}</Typography>,
                  loading: () => <Spinner />,
                  data: (data) => <DelegatorsList delegators={data} onClick={handleDelegatorClick} />,
                  empty: () => <Typography>No Delegators</Typography>,
                },
              )}
              <Commission indexerAddress={address} />
              <OwnDelegation indexerAddress={address} />
            </div>
          );
        },
      })}
    </div>
  );
};

export default IndexerDetails;
