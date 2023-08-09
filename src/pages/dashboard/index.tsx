// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from 'react';
import { BsChatLeftDots } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { IPFSImage } from '@components';
import { getEraProgress, getEraTimeLeft } from '@components/CurEra';
import LineCharts from '@components/LineCharts';
import NewCard from '@components/NewCard';
import { useProjectMetadata } from '@containers';
import { useEra } from '@hooks/useEra';
import { IGetLatestTopics, useForumApis } from '@hooks/useForumApis';
import { Spinner, Tooltip, Typography } from '@subql/components';
import { useGetProjectsQuery } from '@subql/react-hooks';
import { filterSuccessPromoiseSettledResult, notEmpty, parseError, renderAsync, TOKEN } from '@utils';
import formatNumber from '@utils/formatNumber';
import { useInterval } from 'ahooks';
import { Progress } from 'antd';
import Link from 'antd/es/typography/Link';
import clsx from 'clsx';
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
      data: topics,
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

const Dashboard: FC = (props) => {
  const navigate = useNavigate();

  return (
    <div className={styles.dashboard}>
      {/* layout:
        top
        bottom: { left => right }
      */}
      <Typography variant="h4" weight={600}>
        👋 Welcome to SubQuery Network
      </Typography>

      <div className={styles.dashboardMain}>
        <div className={styles.dashboardMainTop}>
          <NewCard
            title="Total Network Rewards"
            titleExtra={BalanceLayout({
              mainBalance: 299999,
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
                  {formatNumber(28888)} {TOKEN}
                </Typography>
              </div>

              <div className={clsx(styles.cardContentLine, 'flex-between')}>
                <Typography variant="small" type="secondary">
                  Total Reward to Delegation
                </Typography>
                <Typography variant="small">
                  {formatNumber(28888)} {TOKEN}
                </Typography>
              </div>
            </div>
          </NewCard>

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
              data={[[820, 932, 901, 934, 1290, 1330, 1320]]}
            ></LineCharts>

            <div style={{ marginTop: 24 }}>
              <LineCharts
                title="Network Rewards"
                dataDimensionsName={['Indexer Rewards', 'Delegation Rewards']}
                data={[[820, 932, 901, 934, 1290, 1330, 1320]]}
              ></LineCharts>
            </div>
          </div>
          <div className={styles.dashboardMainBottomRight}>
            <EraCard></EraCard>
            <ActiveCard></ActiveCard>
            <ForumCard></ForumCard>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
