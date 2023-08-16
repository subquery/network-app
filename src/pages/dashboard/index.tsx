// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from 'react';
import { BsChatLeftDots } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { IPFSImage } from '@components';
import { getEraProgress, getEraTimeLeft } from '@components/CurEra';
import LineCharts, { FilterType } from '@components/LineCharts';
import NewCard from '@components/NewCard';
import { useProjectMetadata } from '@containers';
import { Era, useEra } from '@hooks/useEra';
import { IGetLatestTopics, useForumApis } from '@hooks/useForumApis';
import { Spinner, Tooltip, Typography } from '@subql/components';
import { useGetProjectsQuery } from '@subql/react-hooks';
import { filterSuccessPromoiseSettledResult, notEmpty, parseError, renderAsync, TOKEN, transNumToHex } from '@utils';
import formatNumber, { formatSQT, toPercentage } from '@utils/numberFormatters';
import { useInterval } from 'ahooks';
import { Progress, Skeleton } from 'antd';
import Link from 'antd/es/typography/Link';
import clsx from 'clsx';
import dayjs from 'dayjs';
import moment from 'moment';

import { ProjectMetadata } from 'src/models';

import styles from './index.module.less';

const BalanceLayout = ({
  mainBalance,
  secondaryBalance,
  secondaryTooltip = 'Estimated for next Era',
  token = TOKEN,
}: {
  mainBalance: number;
  secondaryBalance?: number;
  secondaryTooltip?: React.ReactNode;
  token?: string;
}) => {
  const secondaryRender = () => {
    if (!secondaryBalance)
      return (
        <Typography variant="small" type="secondary" style={{ visibility: 'hidden' }}>
          bigo
        </Typography>
      );
    return secondaryTooltip ? (
      <Tooltip title={secondaryTooltip} placement="topLeft">
        <Typography variant="small" type="secondary">
          {formatNumber(secondaryBalance)} {token}
        </Typography>
      </Tooltip>
    ) : (
      <Typography variant="small" type="secondary">
        {formatNumber(secondaryBalance)} {token}
      </Typography>
    );
  };

  return (
    <div className="col-flex">
      <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16 }}>
        <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
          {formatNumber(mainBalance)}
        </Typography>
        {token}
      </div>
      {secondaryRender()}
    </div>
  );
};

const getSplitDataByEra = (currentEra: Era) => {
  const period = currentEra.period;
  const splitData = 3600 * 24;
  const getIncludesEras = (lastTimes: dayjs.Dayjs) => {
    const today = dayjs();
    const secondFromLastTimes = (+today - +lastTimes) / 1000;

    const eras = Math.floor(secondFromLastTimes / period);
    const currentEraIndex = currentEra.index || 0;
    const includesEras = new Array(eras)
      .fill(0)
      .map((_, index) => currentEraIndex - index)
      .filter((i) => i > 0);
    return {
      includesErasHex: includesEras.map(transNumToHex),
      includesEras,
    };
  };

  const fillData = (
    rawData: { keys: string[]; sum: { amount: string } }[],
    includesErasHex: string[],
    paddingLength: number,
  ) => {
    const amounts = rawData.map((i) => {
      return {
        key: i.keys[0],
        amount: formatSQT(i.sum.amount),
      };
    });

    // fill the data that cannot gatherd by Graphql. e.g: includesEras wants to get the data of 0x0c and 0x0d
    // but Graphql just return the data of 0x0c
    includesErasHex.forEach((key) => {
      if (!amounts.find((i) => i.key === key)) {
        amounts.push({ key: key, amount: 0 });
      }
    });

    // Graphql sort is incorrect, because it is a string.
    let renderAmounts = amounts.sort((a, b) => parseInt(a.key, 16) - parseInt(b.key, 16)).map((i) => i.amount);

    // default eras will greater than one day
    if (paddingLength > renderAmounts.length) {
      new Array(paddingLength - renderAmounts.length).fill(0).forEach((_) => renderAmounts.unshift(0));
    }

    // but in dev env will less than one day.
    if (period < splitData) {
      const eraCountOneDay = 86400 / period;
      renderAmounts = renderAmounts.reduce(
        (acc: { result: number[]; curResult: number }, cur, index) => {
          acc.curResult += cur;
          if ((index + 1) % eraCountOneDay === 0 || index === renderAmounts.length - 1) {
            acc.result.push(acc.curResult);
            acc.curResult = 0;
          }

          return acc;
        },
        { result: [], curResult: 0 },
      ).result;

      if (paddingLength > renderAmounts.length) {
        new Array(paddingLength - renderAmounts.length).fill(0).forEach((_) => renderAmounts.unshift(0));
      }
    }

    return renderAmounts;
  };

  return { getIncludesEras, fillData };
};

const EraCard = () => {
  const { currentEra } = useEra();
  const [now, setNow] = useState(new Date());
  useInterval(
    () => {
      setNow(new Date());
    },
    5000,
    { immediate: true },
  );

  return (
    <>
      {renderAsync(currentEra, {
        loading: () => <Spinner></Spinner>,
        error: (e) => <>{parseError(e)}</>,
        data: (eraData) => (
          <NewCard
            title="Current Era"
            titleExtra={
              <div className="col-flex">
                <Typography variant="h5" style={{ color: 'var(--sq-blue600)' }}>
                  {eraData.index}
                </Typography>

                <Typography variant="small" type="secondary" style={{ marginBottom: 12 }}>
                  {getEraTimeLeft(moment(now), moment(eraData.estEndTime))}
                </Typography>
                <Progress
                  strokeColor={{
                    '0%': 'var(--gradient-from)',
                    '100%': 'var(--gradient-to)',
                  }}
                  trailColor={'var(--gray300'}
                  className={styles.progressBar}
                  percent={getEraProgress(now, eraData.estEndTime, eraData.startTime)}
                />
              </div>
            }
            tooltip="1 era = 1 hour"
            width={302}
          ></NewCard>
        ),
      })}
    </>
  );
};

const ActiveCard = () => {
  const navigate = useNavigate();
  const { getMetadataFromCid } = useProjectMetadata();

  const projectsQuery = useGetProjectsQuery({
    variables: {
      offset: 0,
    },
  });

  const [projectsMetadata, setProjectsMetadata] = useState<ProjectMetadata[]>([]);

  const getAllProjectMetadata = async () => {
    if (!projectsQuery.loading && projectsQuery.data?.projects?.nodes) {
      const res = await Promise.allSettled(
        projectsQuery.data?.projects?.nodes.filter(notEmpty).map((i) => getMetadataFromCid(i.metadata)),
      );

      setProjectsMetadata(res.filter(filterSuccessPromoiseSettledResult).map((i) => i.value));
    }
  };

  useEffect(() => {
    getAllProjectMetadata();
  }, [projectsQuery]);

  return (
    <>
      {renderAsync(projectsQuery, {
        loading: () => <Spinner></Spinner>,
        error: (e) => <>{parseError(e)}</>,
        data: (projects) => {
          return (
            <NewCard
              title="Active Projects"
              titleExtra={
                <div style={{ fontSize: 16, display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                    {projects.projects?.totalCount}
                  </Typography>
                  Project
                </div>
              }
              tooltip="The number of actively indexed projects across the entire network"
              width={302}
              style={{ marginTop: 24 }}
            >
              <>
                <div className={styles.images}>
                  {projects.projects?.nodes.filter(notEmpty).map((project, index) => (
                    <IPFSImage
                      key={project.id}
                      src={projectsMetadata[index]?.image || '/static/default.project.png'}
                      className={styles.image}
                      onClick={() => {
                        navigate(`/explorer/project/${project.id}`);
                      }}
                    />
                  ))}
                </div>
                <div>
                  <Link
                    onClick={() => {
                      navigate('/explorer/home');
                    }}
                  >
                    View All Projects
                  </Link>
                </div>
              </>
            </NewCard>
          );
        },
      })}
    </>
  );
};

const ForumCard = () => {
  const forumApis = useForumApis();
  const [topics, setTopics] = useState<IGetLatestTopics['topics']>([]);

  const getTopics = async () => {
    const res = await forumApis.getLatestApi();

    setTopics(res);
  };

  useEffect(() => {
    getTopics();
  }, []);

  return renderAsync(
    {
      loading: !!!topics.length,
      data: !topics.length ? undefined : topics,
    },
    {
      loading: () => <Spinner></Spinner>,
      error: (e) => <>{parseError(e)}</>,
      data: (topics) => {
        return (
          <NewCard
            title={
              <Typography style={{ display: 'flex', alignItems: 'flex-end' }}>
                Forum
                <BsChatLeftDots style={{ fontSize: 20, color: 'var(--sq-blue600)', marginLeft: 10 }}></BsChatLeftDots>
              </Typography>
            }
            width={302}
            style={{ marginTop: 24 }}
          >
            <div className="col-flex">
              {topics.map((topic) => {
                return (
                  <Link
                    key={topic.slug}
                    style={{ marginBottom: 16 }}
                    href={`${import.meta.env.VITE_FORUM_DOMAIN}/t/${topic.slug}`}
                    target="_import { indexerMetadataSchema } from '../../models';
blank"
                  >
                    <Typography variant="medium">{topic.title}</Typography>
                    <Typography variant="small" type="secondary" style={{ marginTop: 8, marginBottom: 0 }}>
                      {moment(topic.last_posted_at).utc(true).fromNow()}
                    </Typography>
                  </Link>
                );
              })}
              <Link href="https://forum.subquery.network/c/kepler-network/16">View Forum</Link>
            </div>
          </NewCard>
        );
      },
    },
  );
};

const TotalRewardsCard = (props: { totalRewards: string; indexerRewards: string; delegationRewards: string }) => {
  return (
    <NewCard
      title="Total Network Rewards"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.totalRewards),
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
            {formatNumber(formatSQT(props.indexerRewards))} {TOKEN}
          </Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Total Reward to Delegation
          </Typography>
          <Typography variant="small">
            {formatNumber(formatSQT(props.delegationRewards))} {TOKEN}
          </Typography>
        </div>
      </div>
    </NewCard>
  );
};

const StakeCard = (props: { totalStake: string; nextTotalStake: string; totalCount: number }) => {
  const navigate = useNavigate();

  return (
    <NewCard
      title="Current Network Stake"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.totalStake),
        secondaryBalance: formatSQT(props.nextTotalStake),
      })}
      tooltip="This is the total staked SQT across the entire network right now. This includes SQT that has been delegated to Indexers"
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Number of Indexers
          </Typography>
          <Typography variant="small">{props.totalCount}</Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Link
            onClick={() => {
              navigate('/delegator/indexers/all');
            }}
          >
            View Indexers
          </Link>
        </div>
      </div>
    </NewCard>
  );
};

const DelegationsCard = (props: { delegatorStake: string; nextDelegatorStake: string; totalCount: number }) => {
  const navigate = useNavigate();

  return (
    <NewCard
      title="Current Network Delegation"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.delegatorStake),
        secondaryBalance: formatSQT(props.nextDelegatorStake),
      })}
      tooltip="This is the total SQT delegated by participants to any Indexer across the entire network right now"
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Number of Delegators
          </Typography>
          <Typography variant="small">{props.totalCount}</Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Link
            onClick={() => {
              navigate('/delegator/indexers/top');
            }}
          >
            Delegate Now
          </Link>
        </div>
      </div>
    </NewCard>
  );
};

const CirculatingCard = (props: { circulatingSupply: string; totalStake: string }) => {
  return (
    <NewCard
      title="Circulating Supply"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.circulatingSupply),
      })}
      tooltip="This is the total circulating supply of SQT across the entire network right now"
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Percentage Staked
          </Typography>
          <Typography variant="small">
            {toPercentage(formatSQT(props.totalStake), formatSQT(props.circulatingSupply))}
          </Typography>
        </div>
      </div>
    </NewCard>
  );
};

const RewardsLineChart = () => {
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });
  const [renderRewards, setRenderRewards] = useState<number[][]>([[]]);
  const [rawRewardsData, setRawRewardsData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });
  const [fetchRewards, rewardsData] = useLazyQuery(gql`
    query MyQuery($eraIds: [String!]) {
      eraRewards(filter: { eraId: { in: $eraIds } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }

      indexerEraReward: eraRewards(filter: { eraId: { in: $eraIds }, isIndexer: { equalTo: true } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }

      delegationEraReward: eraRewards(filter: { eraId: { in: $eraIds }, isIndexer: { equalTo: false } }) {
        groupedAggregates(groupBy: ERA_ID) {
          sum {
            amount
          }
          keys
        }
      }
    }
  `);

  const fetchRewardsByEra = async (filterVal: FilterType | undefined = filter) => {
    if (!currentEra.data) return;
    if (!filterVal) return;
    const { getIncludesEras, fillData } = getSplitDataByEra(currentEra.data);
    const { includesErasHex } = {
      lm: () => getIncludesEras(dayjs().subtract(31, 'day')),
      l3m: () => getIncludesEras(dayjs().subtract(90, 'day')),
      ly: () => getIncludesEras(dayjs().subtract(365, 'day')),
    }[filterVal.date]();
    const res = await fetchRewards({
      variables: {
        eraIds: includesErasHex,
      },
      fetchPolicy: 'no-cache',
    });

    const maxPaddingLength = { lm: 31, l3m: 90, ly: 365 }[filterVal.date];

    const curry = <T extends Parameters<typeof fillData>['0']>(data: T) =>
      fillData(data, includesErasHex, maxPaddingLength);
    const indexerRewards = curry(res.data.indexerEraReward.groupedAggregates);
    const delegationRewards = curry(res.data.delegationEraReward.groupedAggregates);
    setRawRewardsData({
      indexer: indexerRewards,
      delegation: delegationRewards,
      total: fillData(res.data.eraRewards.groupedAggregates, includesErasHex, maxPaddingLength),
    });

    setRenderRewards([indexerRewards, delegationRewards]);
  };

  useEffect(() => {
    fetchRewardsByEra();
  }, [currentEra.data?.index]);

  return renderAsync(rewardsData, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <LineCharts
          value={filter}
          onChange={(val) => {
            setFilter(val);
            fetchRewardsByEra(val);
          }}
          title="Network Rewards"
          dataDimensionsName={['Indexer Rewards', 'Delegation Rewards']}
          chartData={renderRewards}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px">
              <span>${curDate.format('MMM D, YYYY')}</span>
              <div class="flex-between">
                <span>Total</span>
                <span>${formatNumber(rawRewardsData.total[index])} ${TOKEN}</span>
              </div>
              <div class="flex-between">
                <span>Index Rewards</span>
                <span>${formatNumber(rawRewardsData.indexer[index])} ${TOKEN} (${toPercentage(
              rawRewardsData.indexer[index],
              rawRewardsData.total[index],
            )})</span>
              </div>
              <div class="flex-between">
              <span>Delegator Rewards</span>
              <span>${formatNumber(rawRewardsData.delegation[index])} ${TOKEN} (${toPercentage(
              rawRewardsData.delegation[index],
              rawRewardsData.total[index],
            )})</span>
            </div>
            </div>`;
          }}
        ></LineCharts>
      );
    },
  });
};

const StakeAndDelegationLineChart = () => {
  const { currentEra } = useEra();
  const [filter, setFilter] = useState<FilterType>({ date: 'lm' });

  const [fetchStakeAndDelegation, stakeAndDelegation] = useLazyQuery(gql`
    query MyQuery($eraIds: [String!]) {
      indexerStakeSummaries(filter: { eraId: { in: $eraIds } }) {
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

  const [renderStakeAndDelegation, setRenderStakeAndDelegation] = useState<number[][]>([[]]);
  const [rawFetchedData, setRawFetchedData] = useState<{ indexer: number[]; delegation: number[]; total: number[] }>({
    indexer: [],
    delegation: [],
    total: [],
  });

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

  useEffect(() => {
    fetchStakeAndDelegationByEra();
  }, [currentEra.data?.index]);

  return renderAsync(stakeAndDelegation, {
    loading: () => <Spinner></Spinner>,
    error: (e) => <Typography>{parseError(e)}</Typography>,
    data: () => {
      return (
        <LineCharts
          value={filter}
          onChange={(val) => {
            setFilter(val);
            fetchStakeAndDelegationByEra(val);
          }}
          title="Network Staking and Delegation"
          dataDimensionsName={['Staking', 'Delegation']}
          chartData={renderStakeAndDelegation}
          onTriggerTooltip={(index, curDate) => {
            return `<div class="col-flex" style="width: 280px">
          <span>${curDate.format('MMM D, YYYY')}</span>
          <div class="flex-between">
            <span>Total</span>
            <span>${formatNumber(rawFetchedData.total[index])} ${TOKEN}</span>
          </div>
          <div class="flex-between">
            <span>Index Rewards</span>
            <span>${formatNumber(rawFetchedData.indexer[index])} ${TOKEN} (${toPercentage(
              rawFetchedData.indexer[index],
              rawFetchedData.total[index],
            )})</span>
          </div>
          <div class="flex-between">
          <span>Delegator Rewards</span>
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

const Dashboard: FC = () => {
  const result = useQuery(gql`
    query MyQuery {
      eraRewards {
        aggregates {
          sum {
            amount
          }
        }
      }

      rewardsToIndexer: eraRewards(filter: { isIndexer: { equalTo: true } }) {
        totalCount
        aggregates {
          sum {
            amount
          }
        }
      }

      rewardsToDelegation: eraRewards(filter: { isIndexer: { equalTo: false } }) {
        totalCount
        aggregates {
          sum {
            amount
          }
        }
      }

      indexerStakeSummary(id: "0x00") {
        indexerStake
        nextDelegatorStake
        nextIndexerStake
        nextTotalStake
        totalStake
        delegatorStake
      }

      sqtokens {
        aggregates {
          sum {
            circulatingSupply
            totalSupply
          }
        }
      }

      indexers {
        totalCount
      }

      delegations {
        totalCount
      }
    }
  `);
  return (
    <div className={styles.dashboard}>
      {/* layout:
        top
        bottom: { left => right }
      */}
      <Typography variant="h4" weight={600}>
        👋 Welcome to SubQuery Network
      </Typography>

      {renderAsync(result, {
        loading: () => <Skeleton active paragraph={{ rows: 10 }} />,
        error: (e) => <Typography>{parseError(e)}</Typography>,
        data: (fetchedData) => {
          return (
            <div className={styles.dashboardMain}>
              <div className={styles.dashboardMainTop}>
                <TotalRewardsCard
                  totalRewards={fetchedData.eraRewards.aggregates.sum.amount}
                  indexerRewards={fetchedData.rewardsToIndexer.aggregates.sum.amount}
                  delegationRewards={fetchedData.rewardsToDelegation.aggregates.sum.amount}
                ></TotalRewardsCard>
                <StakeCard
                  totalStake={fetchedData.indexerStakeSummary.totalStake}
                  nextTotalStake={fetchedData.indexerStakeSummary.nextTotalStake}
                  totalCount={fetchedData.indexers.totalCount}
                ></StakeCard>

                <DelegationsCard
                  delegatorStake={fetchedData.indexerStakeSummary.delegatorStake}
                  nextDelegatorStake={fetchedData.indexerStakeSummary.nextDelegatorStake}
                  totalCount={fetchedData.delegations.totalCount}
                ></DelegationsCard>

                <CirculatingCard
                  circulatingSupply={fetchedData.sqtokens.aggregates.sum.circulatingSupply}
                  totalStake={fetchedData.indexerStakeSummary.totalStake}
                ></CirculatingCard>
              </div>
              <div className={styles.dashboardMainBottom}>
                <div className={styles.dashboardMainBottomLeft}>
                  <StakeAndDelegationLineChart></StakeAndDelegationLineChart>

                  <div style={{ marginTop: 24 }}>
                    <RewardsLineChart></RewardsLineChart>
                  </div>
                </div>
                <div className={styles.dashboardMainBottomRight}>
                  <EraCard></EraCard>
                  <ActiveCard></ActiveCard>
                  <ForumCard></ForumCard>
                </div>
              </div>
            </div>
          );
        },
      })}
    </div>
  );
};
export default Dashboard;
