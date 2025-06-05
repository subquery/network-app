// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import IPFSImage from '@components/IPFSImage';
import { useProjectMetadata } from '@containers';
import { SubqlCard, Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { filterSuccessPromoiseSettledResult, getMonthProgress, notEmpty } from '@utils';
import { useInterval } from 'ahooks';
import { Button, Carousel, Progress, Skeleton } from 'antd';
import dayjs from 'dayjs';
import { toSvg } from 'jdenticon';

import { ProjectMetadata } from 'src/models';

import styles from './ActiveCard.module.less';

const baseUrl = import.meta.env.VITE_CONSUMER_CAMPAIGN_URL;

const notStart = +dayjs() < +dayjs('2025-05-01T00:00:00Z');

export const ActiveCard = () => {
  const navigate = useNavigate();
  const { getMetadataFromCid } = useProjectMetadata();
  const [serverNow, setServerNow] = useState<number>(0);
  const projectsQuery = useQuery<{ projects: { totalCount: number; nodes: { id: string; metadata: string }[] } }>(gql`
    query GetProjects(
      $offset: Int
      $type: [ProjectType!] = [SUBQUERY, SUBGRAPH, RPC]
      $orderBy: [ProjectsOrderBy!] = [TOTAL_REWARD_DESC, UPDATED_TIMESTAMP_DESC]
    ) {
      projects(first: 30, offset: $offset, orderBy: $orderBy, filter: { type: { in: $type } }) {
        totalCount
        nodes {
          id
          metadata
        }
      }
    }
  `);

  const [projectsMetadata, setProjectsMetadata] = useState<ProjectMetadata[]>([]);

  const getAllProjectMetadata = async () => {
    if (!projectsQuery.loading && projectsQuery.data?.projects?.nodes.slice(0, 50)) {
      const res = await Promise.allSettled(
        projectsQuery.data?.projects?.nodes
          .slice(0, 50)
          .filter(notEmpty)
          .map((i) => getMetadataFromCid(i.metadata)),
      );

      setProjectsMetadata(res.filter(filterSuccessPromoiseSettledResult).map((i) => i.value));
    }
  };

  useEffect(() => {
    getAllProjectMetadata();
  }, [projectsQuery]);

  useEffect(() => {
    setServerNow(+new Date());
  }, []);

  useEffect(() => {
    const fetchCompaign = async () => {
      const res = await fetch(`${baseUrl}/compaign/reward`, {
        method: 'GET',
      });
      const data: {
        code: number;
        now: number;
        data: [
          {
            pt: 'subquery' | 'subgraph';
            total: string;
            distr: string;
            month: string;
          },
        ];
      } = await res.json();
      setServerNow(+`${data.now}000`);
    };

    fetchCompaign();
  }, []);

  useInterval(() => {
    setServerNow(serverNow + 3000);
  }, 3000);

  return (
    <>
      {renderAsync(projectsQuery, {
        loading: () => (
          <Skeleton
            avatar
            active
            style={{ display: 'flex', maxHeight: 176, marginTop: 24, marginBottom: 40 }}
            paragraph={{ rows: 4 }}
          ></Skeleton>
        ),
        error: (e) => (
          <Skeleton
            avatar
            active
            style={{ display: 'flex', maxHeight: 176, marginTop: 24, marginBottom: 40 }}
            paragraph={{ rows: 4 }}
          ></Skeleton>
        ),
        data: (projects) => {
          return (
            <Carousel
              style={{
                marginTop: 24,
                marginBottom: 40,
              }}
              className={styles.activeCarousel}
              autoplay
            >
              <SubqlCard
                title={
                  <div className="col-flex" style={{ position: 'relative', width: '100%', gap: 16 }}>
                    <Typography variant="h5" weight={500} style={{ whiteSpace: 'pre-wrap' }}>
                      Decentralised RPCs and Indexed Datasets
                    </Typography>
                    <Typography type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                      Access decentralised data from across web3 in only a few minutes from any of our{' '}
                      {projects.projects?.totalCount} projects
                    </Typography>
                    <div className={styles.images}>
                      {projects.projects?.nodes.filter(notEmpty).map((project, index) => (
                        <IPFSImage
                          key={project.id}
                          src={
                            projectsMetadata[index]?.image ||
                            `data:image/svg+xml;utf8,${encodeURIComponent(toSvg(projectsMetadata[index]?.name, 500))}`
                          }
                          className={styles.image}
                          onClick={() => {
                            navigate(`/explorer/project/${project.id}`);
                          }}
                        />
                      ))}
                    </div>

                    <div className="flex-center">
                      <Button
                        className={styles.explorerButton}
                        shape="round"
                        size="large"
                        type="primary"
                        onClick={() => {
                          navigate(`/explorer`);
                        }}
                      >
                        View Projects
                      </Button>
                    </div>
                  </div>
                }
                style={{ width: '100%' }}
                className={styles.projectsCard}
              ></SubqlCard>

              <SubqlCard
                title={
                  <div className="col-flex" style={{ position: 'relative', width: '100%', gap: 16 }}>
                    <Typography variant="h5" weight={500} style={{ whiteSpace: 'pre-wrap' }}>
                      Consumer Rewards Programme
                    </Typography>
                    <Typography type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                      Earn up to 900% of your query spending in SQT rewards, with dedicated reward pools for both
                      Subgraphs and SubQuery Projects.
                    </Typography>

                    <div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <Typography>Current Rewards Period</Typography>
                        <img src="/consumer-rewards/rewards-period.svg"></img>
                        <span style={{ flex: 1 }}></span>
                        <Typography variant="small" style={{ lineHeight: 1, color: 'var(--sq-blue600)' }} weight={600}>
                          {notStart ? 'Not Started' : getMonthProgress(serverNow).endsIn}
                        </Typography>
                      </div>

                      <Progress
                        strokeColor={{
                          from: '#4388DD',
                          to: '#FF4581',
                        }}
                        trailColor="#dfe3e8"
                        percent={notStart ? 0 : getMonthProgress(serverNow).percentageUsed}
                      ></Progress>
                    </div>

                    <div className="flex-center">
                      <Button
                        className={styles.explorerRewardButton}
                        shape="round"
                        size="large"
                        type="primary"
                        onClick={() => {
                          navigate(`/explorer`);
                        }}
                      >
                        View Projects
                      </Button>
                    </div>
                  </div>
                }
                style={{ width: '100%' }}
                className={styles.consumerRewardsCard}
              ></SubqlCard>
            </Carousel>
          );
        },
      })}
    </>
  );
};
