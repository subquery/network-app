// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, ReactNode, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { CurEra, Table } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import NewCard from '@components/NewCard';
import { useWeb3 } from '@containers';
import { useEra } from '@hooks';
import { parseRawEraValue } from '@hooks/useEraValue';
import { getCommission, useSortedIndexer } from '@hooks/useSortedIndexer';
import { BalanceLayout } from '@pages/dashboard';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { DoDelegate } from '@pages/delegator/DoDelegate';
import { DoUndelegate } from '@pages/delegator/DoUndelegate';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { parseError } from '@utils';
import { TOKEN } from '@utils/constants';
import formatNumber, { formatSQT } from '@utils/numberFormatters';
import clsx from 'clsx';
import { isString } from 'lodash-es';

import styles from './index.module.less';

const AccountHeader: React.FC<{ account: string }> = ({ account }) => {
  const { account: connectedAccount } = useWeb3();
  const canDelegate = useMemo(() => connectedAccount !== account, [connectedAccount, account]);

  return (
    <div className="flex" style={{ width: '100%' }}>
      <div className="flex">
        <ConnectedIndexer id={account} size="large"></ConnectedIndexer>
      </div>
      {canDelegate && (
        <div className="flex" style={{ marginLeft: 16 }}>
          <DoDelegate indexerAddress={account} />
          <DoUndelegate indexerAddress={account} variant={'button'} />
        </div>
      )}

      <span style={{ flex: 1 }}></span>

      <CurEra></CurEra>
    </div>
  );
};

const AccountBaseInfo = () => {
  const makeChunk = ({ title, value }: { title: ReactNode; value: ReactNode }) => {
    return (
      <div className="col-flex">
        <Typography variant="small">{title}</Typography>
        {isString(value) ? (
          <Typography variant="text" weight={500}>
            {value}
          </Typography>
        ) : (
          value
        )}
      </div>
    );
  };
  return (
    <div className={styles.accountBaseInfo}>
      {makeChunk({ title: 'Indexer Rank', value: '#4' })}

      {makeChunk({ title: 'Uptime', value: '#4' })}

      {makeChunk({ title: 'Era Reward Collection', value: '#4' })}

      {makeChunk({ title: 'SSL', value: '#4' })}

      {makeChunk({ title: 'Social Credibility', value: '#4' })}
    </div>
  );
};

const IndexerProfile: FC = () => {
  const { id: account } = useParams();
  const { currentEra } = useEra();
  const sortedIndexer = useSortedIndexer(account || '');
  const indexerDelegators = useGetIndexerDelegatorsQuery({ variables: { id: account ?? '', offset: 0 } });
  const result = useQuery(
    gql`
      query MyQuery($indexerId: String!) {
        eraRewards(filter: { indexerId: { equalTo: $indexerId } }) {
          aggregates {
            sum {
              amount
            }
          }
        }

        delegatorEraRewards: eraRewards(filter: { indexerId: { equalTo: $indexerId }, isIndexer: { equalTo: false } }) {
          aggregates {
            sum {
              amount
            }
          }
        }

        indexer(id: $indexerId) {
          commission
        }
        indexerStakes(filter: { id: { includes: $indexerId } }) {
          aggregates {
            sum {
              delegatorStake
              indexerStake
              totalStake
            }
          }
        }
      }
    `,
    {
      variables: {
        indexerId: account,
      },
    },
  );

  return renderAsync(result, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: (fetchedResult) => {
      if (!sortedIndexer.data) return <></>;

      return (
        <div className={styles.indexerProfile}>
          {/* top to bottom */}
          <div className="col-flex">
            <AccountHeader account={account ?? ''} />

            <AccountBaseInfo></AccountBaseInfo>

            <div className="flex-between" style={{ margin: '24px 0' }}>
              <NewCard
                title="Total Rewards"
                titleExtra={BalanceLayout({
                  mainBalance: formatSQT(fetchedResult.eraRewards.aggregates.sum.amount),
                })}
                tooltip="This is the total rewards that have been claimed or are able to be claimed by this indexer right now"
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Current Commission Rate
                    </Typography>
                    <Typography variant="small">
                      {getCommission(fetchedResult.indexer.commission, currentEra.data?.index).current} %
                    </Typography>
                  </div>

                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Total Rewards to Delegators
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(formatSQT(fetchedResult.delegatorEraRewards.aggregates.sum.amount))} {TOKEN}
                    </Typography>
                  </div>
                </div>
              </NewCard>

              <NewCard
                title="Current Total Stake"
                titleExtra={BalanceLayout({
                  mainBalance: sortedIndexer.data.totalStake.current,
                  secondaryBalance: sortedIndexer.data.totalStake.after,
                })}
                tooltip="This is the total staked SQT by this indexer. This includes SQT that has been delegated to this Indexer"
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Own Stake
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(sortedIndexer.data.ownStake.current)} {TOKEN}
                    </Typography>
                  </div>

                  {sortedIndexer.data.ownStake.after && (
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" style={{ visibility: 'hidden' }}>
                        bigo
                      </Typography>
                      <Typography
                        variant="small"
                        type="secondary"
                        style={{ transform: 'scale(0.83333) translateX(7px)', marginLeft: 3 }}
                      >
                        {formatNumber(sortedIndexer.data.ownStake.after)} {TOKEN}
                      </Typography>
                    </div>
                  )}
                </div>
              </NewCard>

              <NewCard
                title="Current Total Delegation"
                titleExtra={BalanceLayout({
                  mainBalance: sortedIndexer.data.totalDelegations.current,
                  secondaryBalance: sortedIndexer.data.totalDelegations.after,
                })}
                tooltip="This is the total SQT delegated by participants to this Indexer right now."
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Remaining Capacity
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(sortedIndexer.data.capacity.current)} {TOKEN}
                    </Typography>
                  </div>

                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Number of Delegators
                    </Typography>
                    <Typography variant="small">{indexerDelegators.data?.indexer?.delegations.totalCount}</Typography>
                  </div>
                </div>
              </NewCard>

              <NewCard
                title="Active Projects"
                titleExtra={BalanceLayout({
                  mainBalance: formatSQT('9999999999'),
                })}
                tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
                width={302}
              >
                <div className="col-flex">
                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Total Reward to Indexers
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(formatSQT('999999999999'))} {TOKEN}
                    </Typography>
                  </div>

                  <div className={clsx(styles.cardContentLine, 'flex-between')}>
                    <Typography variant="small" type="secondary">
                      Total Reward to Delegation
                    </Typography>
                    <Typography variant="small">
                      {formatNumber(formatSQT('99999999999999'))} {TOKEN}
                    </Typography>
                  </div>
                </div>
              </NewCard>
            </div>

            <StakeAndDelegationLineChart></StakeAndDelegationLineChart>

            <div style={{ marginTop: 24 }}>
              <StakeAndDelegationLineChart></StakeAndDelegationLineChart>
            </div>

            <div className={styles.indexerDelegator}>
              <div className="flex">
                <Typography variant="large" weight={600}>
                  Indexer's Delegators
                </Typography>

                <Typography variant="large" weight={600} type="secondary">
                  (300)
                </Typography>
              </div>
              <Table></Table>
            </div>
          </div>
        </div>
      );
    },
  });
};
export default IndexerProfile;
