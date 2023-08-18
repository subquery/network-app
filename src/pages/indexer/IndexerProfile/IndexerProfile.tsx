// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { CurEra, IPFSImage, Table } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import LineCharts, { FilterType } from '@components/LineCharts';
import NewCard from '@components/NewCard';
import { useProjectMetadata, useWeb3 } from '@containers';
import { useEra, useSortedIndexerDeployments } from '@hooks';
import { parseRawEraValue } from '@hooks/useEraValue';
import { getCommission, useSortedIndexer } from '@hooks/useSortedIndexer';
import { BalanceLayout } from '@pages/dashboard';
import { getSplitDataByEra } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { StakeAndDelegationLineChart } from '@pages/dashboard/components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import { DoDelegate } from '@pages/delegator/DoDelegate';
import { DoUndelegate } from '@pages/delegator/DoUndelegate';
import { Spinner, Typography } from '@subql/components';
import { renderAsync, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { filterSuccessPromoiseSettledResult, notEmpty, parseError } from '@utils';
import { TOKEN } from '@utils/constants';
import formatNumber, { formatSQT, toPercentage } from '@utils/numberFormatters';
import { Skeleton } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
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

const ActiveCard = (props: { account: string }) => {
  const navigate = useNavigate();

  const indexerDeployments = useSortedIndexerDeployments(props.account);

  return renderAsync(indexerDeployments, {
    loading: () => <Skeleton style={{ width: 302 }}></Skeleton>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => (
      <NewCard
        title="Active Projects"
        titleExtra={
          <>
            <div style={{ fontSize: 16, display: 'flex', alignItems: 'baseline' }}>
              <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                {indexerDeployments.data?.length}
              </Typography>
              Project
            </div>

            <div style={{ visibility: 'hidden', height: 18 }}>1</div>
          </>
        }
        tooltip="The number of actively indexed projects across the entire network"
        width={302}
      >
        <>
          <div className={styles.images}>
            {indexerDeployments.data
              ?.filter(notEmpty)
              .slice(0, 9)
              .map((project, index) => (
                <IPFSImage
                  key={project.id}
                  src={project.projectMeta.image || '/static/default.project.png'}
                  className={styles.image}
                  onClick={() => {
                    navigate(`/explorer/project/${project.id}`);
                  }}
                />
              ))}
          </div>
        </>
      </NewCard>
    ),
  });
};

const StakeChart = (props: { account: string }) => {
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });

  const [fetchStakeAndDelegation, stakeAndDelegation] = useLazyQuery(gql`
    query MyQuery($indexerId: String!, $eraIds: [String!]) {
      indexerStakeSummaries(filter: { eraId: { in: $eraIds } }, id: { equalTo: $indexerId }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            delegatorStake
            indexerStake
            totalStake
          }
          keys
        }
      }
    }
  `);

  const fetchStakeAndDelegationByEra = async (filterVal: FilterType | undefined = filter) => {
    if (!filterVal) return;
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data);

    const { includesErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();

    const res = await fetchStakeAndDelegation({
      variables: {
        eraIds: includesErasHex,
      },
      fetchPolicy: 'no-cache',
    });

    const maxPaddingLength = { lm: 31, l3m: 90, ly: 365 }[filterVal.date];
    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(data, includesErasHex, maxPaddingLength);

    const indexerStakes = curry(
      res.data.indexerStakeSummaries.groupedAggregates.map((i) => ({ ...i, sum: { amount: i.sum.indexerStake } })),
    );
    const delegationStakes = curry(
      res.data.indexerStakeSummaries.groupedAggregates.map((i) => ({ ...i, sum: { amount: i.sum.delegatorStake } })),
    );
    setRawFetchedData({
      indexer: indexerStakes,
      delegation: delegationStakes,
      total: curry(
        res.data.indexerStakeSummaries.groupedAggregates.map((i) => ({ ...i, sum: { amount: i.sum.totalStake } })),
      ),
    });

    setRenderStakeAndDelegation([indexerStakes, delegationStakes]);
  };

  const [renderStakeAndDelegation, setRenderStakeAndDelegation] = useState<number[][]>([[]]);
  const [rawFetchedData, setRawFetchedData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });

  useEffect(() => {
    fetchStakeAndDelegationByEra();
  }, [currentEra.data?.index]);

  return renderAsync(stakeAndDelegation, {
    loading: () => <Skeleton active paragraph={{ rows: 8 }}></Skeleton>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <LineCharts
          value={filter}
          onChange={(val) => {
            setFilter(val);
            fetchStakeAndDelegationByEra(val);
          }}
          title="Stake"
          dataDimensionsName={['Own Stake', 'Delegation']}
          chartData={renderStakeAndDelegation}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px">
          <span>${curDate.format('MMM D, YYYY')}</span>
          <div class="flex-between" style="margin-top: 8px;">
            <span>Total Stake</span>
            <span>${formatNumber(rawFetchedData.total[index])} ${TOKEN}</span>
          </div>
          <div class="flex-between" style="margin: 8px 0;">
            <span>Own Stake</span>
            <span>${formatNumber(rawFetchedData.indexer[index])} ${TOKEN} (${toPercentage(
              rawFetchedData.indexer[index],
              rawFetchedData.total[index],
            )})</span>
          </div>
          <div class="flex-between">
          <span>Delegation</span>
          <span>${formatNumber(rawFetchedData.delegation[index])} ${TOKEN} (${toPercentage(
              rawFetchedData.delegation[index],
              rawFetchedData.total[index],
            )})</span>
        </div>
        </div>`;
          }}
        ></LineCharts>
      );
    },
  });
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

              <ActiveCard account={account || ''}></ActiveCard>
            </div>

            <StakeChart account={account || ''}></StakeChart>

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
