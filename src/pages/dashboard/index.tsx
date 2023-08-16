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
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { useEra } from '@hooks/useEra';
import { IGetLatestTopics, useForumApis } from '@hooks/useForumApis';
import { Spinner, Tooltip, Typography } from '@subql/components';
import { useGetProjectsQuery } from '@subql/react-hooks';
import {
  filterSuccessPromoiseSettledResult,
  notEmpty,
  parseError,
  renderAsync,
  TOKEN,
  tokenDecimals,
  transNumToHex,
} from '@utils';
import formatNumber, { toPercentage } from '@utils/numberFormatters';
import { useInterval } from 'ahooks';
import { Progress, Skeleton } from 'antd';
import Link from 'antd/es/typography/Link';
import BigNumberJs from 'bignumber.js';
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
  secondaryBalance: number;
  secondaryTooltip?: React.ReactNode;
  token?: string;
}) => {
  return (
    <div className="col-flex">
      <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16 }}>
        <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
          {formatNumber(mainBalance)}
        </Typography>
        {token}
      </div>
      {secondaryTooltip ? (
        <Tooltip title={secondaryTooltip} placement="topLeft">
          <Typography variant="small" type="secondary">
            {formatNumber(secondaryBalance)} {token}
          </Typography>
        </Tooltip>
      ) : (
        <Typography variant="small" type="secondary">
          {formatNumber(secondaryBalance)} {token}
        </Typography>
      )}
    </div>
  );
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
                    target="_blank"
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
        mainBalance: BigNumberJs(props.totalRewards)
          .div(10 ** tokenDecimals[SQT_TOKEN_ADDRESS])
          .toNumber(),
        secondaryBalance: 29999,
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
            {formatNumber(
              BigNumberJs(props.indexerRewards)
                .div(10 ** tokenDecimals[SQT_TOKEN_ADDRESS])
                .toNumber(),
            )}{' '}
            {TOKEN}
          </Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Total Reward to Delegation
          </Typography>
          <Typography variant="small">
            {formatNumber(
              BigNumberJs(props.delegationRewards)
                .div(10 ** tokenDecimals[SQT_TOKEN_ADDRESS])
                .toNumber(),
            )}{' '}
            {TOKEN}
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
  const [rawRewardsData, setRawRewardsData] = useState({
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

  const fetchRewardsByDate = async (filterVal: FilterType | undefined = filter) => {
    if (!filterVal) return;
    // const period = currentEra.data?.period;
    const period = 3600 * 24 * 7;
    if (!period) return;
    const splitData = 3600 * 24;
    if (period > splitData && period % splitData !== 0) {
      // i'm not sure how to show if a period is like 1.5 day.
      // would better do not have this kind of era period. otherwise we must change the statistical dimension
      return;
    }
    if (period < splitData && splitData % period !== 0) {
      // same to above.
      return;
    }

    const getIncludesEras = (lastTimes: dayjs.Dayjs) => {
      const today = dayjs();
      const secondFromLastTimes = (+today - +lastTimes) / 1000;

      const eras = Math.floor(secondFromLastTimes / period);
      // const currentEraIndex = currentEra.data?.index || 0;
      const currentEraIndex = 17;
      const includesEras = new Array(eras + 1).fill(0).map((_, index) => currentEraIndex - index);

      return [includesEras.filter((i) => i > 0).map(transNumToHex), includesEras];
    };

    const [filterIncludesEras, includesEras] = {
      lm: () => getIncludesEras(dayjs().subtract(1, 'month')),
      l3m: () => getIncludesEras(dayjs().subtract(3, 'month')),
      ly: () => getIncludesEras(dayjs().subtract(1, 'year')),
    }[filterVal.date]();

    const res = await fetchRewards({
      variables: {
        eraIds: filterIncludesEras,
      },
      fetchPolicy: 'no-cache',
    });

    const fillData = (rawData) => {
      const amounts = rawData.map((i) => {
        return {
          key: i.keys[0],
          amount: BigNumberJs(i.sum.amount)
            .div(10 ** tokenDecimals[SQT_TOKEN_ADDRESS])
            .toNumber(),
        };
      });

      // fill the data that cannot gatherd by Graphql. e.g: includesEras wants to get the data of 0x0c and 0x0d
      // but Graphql just return the data of 0x0c
      filterIncludesEras.forEach((key) => {
        if (!amounts.find((i) => i.key === key)) {
          amounts.push({ key: key, amount: 0 });
        }
      });

      // Graphql sort is incorrect, because it is a string.
      let renderAmounts = amounts.sort((a, b) => parseInt(a.key, 16) - parseInt(b.key, 16)).map((i) => i.amount);

      // default eras will greater than one day
      // but in dev env will less than one day.
      if (renderAmounts.length < includesEras.length) {
        new Array(includesEras.length - renderAmounts.length).fill(0).forEach((_) => renderAmounts.unshift(0));
      }
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

        new Array({ lm: 31, l3m: 90, ly: 365 }[filter.date] - renderAmounts.length)
          .fill(0)
          .forEach((_) => renderAmounts.unshift(0));
      }

      return renderAmounts;
    };

    const indexerRewards = fillData(res.data.indexerEraReward.groupedAggregates);
    const delegationRewards = fillData(res.data.delegationEraReward.groupedAggregates);
    setRawRewardsData({
      indexer: indexerRewards,
      delegation: delegationRewards,
      total: fillData(res.data.eraRewards.groupedAggregates),
    });

    setRenderRewards([indexerRewards, delegationRewards]);
  };

  useEffect(() => {
    fetchRewardsByDate();
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
            fetchRewardsByDate(val);
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

const Dashboard: FC = () => {
  const navigate = useNavigate();
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

      sqtokens {
        totalCount
        nodes {
          circulatingSupply
          id
          totalSupply
        }
      }
      planByNodeId(nodeId: "") {
        id
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
                <NewCard
                  title="Current Network Stake"
                  titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
                  tooltip="This is the total staked SQT across the entire network right now. This includes SQT that has been delegated to Indexers"
                  width={302}
                >
                  <div className="col-flex">
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" type="secondary">
                        Number of Indexers
                      </Typography>
                      <Typography variant="small">50</Typography>
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

                <NewCard
                  title="Current Network Delegation"
                  titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
                  tooltip="This is the total SQT delegated by participants to any Indexer across the entire network right now"
                  width={302}
                >
                  <div className="col-flex">
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" type="secondary">
                        Number of Delegators
                      </Typography>
                      <Typography variant="small">300</Typography>
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

                <NewCard
                  title="Circulating Supply"
                  titleExtra={BalanceLayout({ mainBalance: 299999, secondaryBalance: 29999 })}
                  tooltip="This is the total circulating supply of SQT across the entire network right now"
                  width={302}
                >
                  <div className="col-flex">
                    <div className={clsx(styles.cardContentLine, 'flex-between')}>
                      <Typography variant="small" type="secondary">
                        Percentage Staked
                      </Typography>
                      <Typography variant="small">88%</Typography>
                    </div>
                  </div>
                </NewCard>
              </div>
              <div className={styles.dashboardMainBottom}>
                <div className={styles.dashboardMainBottomLeft}>
                  <LineCharts
                    title="Network Staking and Delegation"
                    dataDimensionsName={['Staking', 'Delegation']}
                    chartData={[[820, 932, 901, 934, 1290, 1330, 1320]]}
                  ></LineCharts>

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
