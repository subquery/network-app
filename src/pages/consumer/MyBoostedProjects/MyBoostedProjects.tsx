// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import { AppPageHeader, DeploymentMeta } from '@components';
import DoBooster from '@components/DoBooster';
import { useAccount } from '@containers/Web3';
import { BalanceLayout } from '@pages/dashboard';
import { Spinner, SubqlCard, Typography } from '@subql/components';
import { formatSQT, useGetDeploymentBoosterProjectsAndTotalByConsumerQuery } from '@subql/react-hooks';
import { cidToBytes32, formatNumber, notEmpty, TOKEN } from '@utils';
import { Button, Table } from 'antd';
import BigNumberJs from 'bignumber.js';

import { useWeb3Store } from 'src/stores';

import { EmptyList } from '../../../components/EmptyList/EmptyList';
import styles from './index.module.less';

const MyBoostedProjects: FC = () => {
  const { address: account } = useAccount();
  const { contracts } = useWeb3Store();
  const [pages, setPages] = React.useState({
    first: 10,
    offset: 0,
    current: 1,
  });

  const [mounted, setMounted] = useState(false);
  const [rewards, setRewards] = useState<
    {
      deploymentId: string;
      rewards: string;
    }[]
  >([]);
  const [totalRewards, setTotalRewards] = useState('0');

  const boostedProjects = useGetDeploymentBoosterProjectsAndTotalByConsumerQuery({
    variables: {
      consumer: account || '',
      ...pages,
    },
    fetchPolicy: 'network-only',
    onCompleted: () => {
      setMounted(true);
    },
  });

  const existingBoost = useMemo(() => {
    if (boostedProjects.data) {
      return BigNumberJs(
        boostedProjects.data?.totalBoostedAmount?.aggregates?.sum?.totalAmount.toString() || '0',
      ).toString();
    }

    if (boostedProjects.previousData) {
      return BigNumberJs(
        boostedProjects.previousData?.totalBoostedAmount?.aggregates?.sum?.totalAmount.toString() || '0',
      ).toString();
    }

    return '0';
  }, [boostedProjects.data]);

  const empty = useMemo(() => {
    if (boostedProjects.loading) return false;
    if (boostedProjects.data) {
      if (boostedProjects.data?.totalBoostedAmount?.aggregates?.sum?.totalAmount.toString() !== '0') {
        return false;
      }
    }

    return true;
  }, [boostedProjects.data, mounted]);

  const showLoading = useMemo(() => !mounted && boostedProjects.loading, [boostedProjects.loading, mounted]);

  const fetchRewards = async () => {
    if (!contracts) return '0';
    const rewards = await Promise.allSettled(
      boostedProjects.data?.deploymentBoosterSummaries?.nodes?.map((i) => {
        return contracts.rewardsBooster.getAccQueryRewards(cidToBytes32(i?.deploymentId || ''), account || '');
      }) || [],
    );

    const total = rewards.reduce((acc, cur) => {
      if (cur.status === 'fulfilled') {
        return acc.plus(cur.value.toString());
      }
      return acc;
    }, BigNumberJs(0));

    setTotalRewards(total.toString());

    setRewards(
      rewards.map((i, index) => {
        return {
          deploymentId: boostedProjects.data?.deploymentBoosterSummaries?.nodes?.[index]?.deploymentId || '',
          rewards: i.status === 'fulfilled' ? i.value.toString() : '0',
        };
      }),
    );
  };

  useEffect(() => {
    fetchRewards();
  }, [boostedProjects.data]);

  useEffect(() => {
    setMounted(false);
  }, [account]);

  const mainRender = () => {
    if (showLoading) return <Spinner></Spinner>;
    if (empty)
      return (
        <EmptyList
          title={'You haven’t boosted any projects yet'}
          description={
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 32 }}>
              <Typography type="secondary">
                Boosting provides Query Rewards allowing you to make free queries to the boosted project. By boosting
                you encourage more Node Operators to join, enhancing performance and resilience of the project.
              </Typography>

              <Typography type="secondary">
                Boosting differs from Delegating in that it promotes the overall health of the project, while Delegating
                directs support to individual Node Operators.
              </Typography>

              <Typography type="secondary">
                Follow our{' '}
                <Typography.Link
                  href="https://academy.subquery.network/subquery_network/consumers/boosting.html#how-to-boost-an-project"
                  type="info"
                  style={{ textDecoration: 'underline' }}
                >
                  Documentation
                </Typography.Link>{' '}
                to learn how to boost a project, then navigate to the Explorer to select the first project you’d like to
                boost
              </Typography>
            </div>
          }
        >
          <a href="/explorer/home" target="_blank">
            <Button type="primary" shape="round" size="large">
              Boost now
            </Button>
          </a>
        </EmptyList>
      );

    return (
      <>
        <SubqlCard
          title="Current Total Boosts"
          tooltip="The total amount that is currently boosted to projects. "
          titleExtra={BalanceLayout({
            mainBalance: formatSQT(existingBoost),
          })}
          width={360}
        >
          <div className="flex" style={{ justifyContent: 'space-between' }}>
            <Typography variant="small" type="secondary">
              Total Query Rewards
            </Typography>
            <Typography>
              {formatNumber(formatSQT(totalRewards))} {TOKEN}
            </Typography>
          </div>
        </SubqlCard>

        <Table
          dataSource={boostedProjects.data?.deploymentBoosterSummaries?.nodes.filter(notEmpty) || []}
          columns={[
            {
              title: 'Project',
              dataIndex: 'deploymentId',
              render: (deploymentId: string, deployment) => (
                <DeploymentMeta deploymentId={deploymentId} projectMetadata={deployment?.project?.metadata || ''} />
              ),
            },
            {
              title: 'Boosted amount',
              dataIndex: 'totalAmount',
              render: (totalAmount: string) => (
                <Typography>
                  {formatNumber(formatSQT(totalAmount || '0'))} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Boosted rewards',
              dataIndex: 'deploymentId',
              render: (deploymentId: string) => (
                <Typography>
                  {formatNumber(formatSQT(rewards.find((i) => i.deploymentId === deploymentId)?.rewards || '0'))}{' '}
                  {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Action',
              dataIndex: 'deploymentId',
              render: (deploymentId: string, record) => (
                <div className="flex" style={{ gap: 16 }}>
                  <DoBooster
                    deploymentId={deploymentId}
                    projectId={record.projectId}
                    actionBtn={<Typography.Link type="info">Add Boost</Typography.Link>}
                    onSuccess={() => boostedProjects.refetch()}
                  ></DoBooster>
                  <DoBooster
                    deploymentId={deploymentId}
                    projectId={record.projectId}
                    actionBtn={<Typography.Link type="danger">Remove Boost</Typography.Link>}
                    onSuccess={() => boostedProjects.refetch()}
                    initAddOrRemove="remove"
                  ></DoBooster>
                </div>
              ),
            },
          ]}
          loading={boostedProjects.loading}
          rowKey={(record) => record.deploymentId}
          pagination={{
            current: pages.current,
            total: boostedProjects.data?.deploymentBoosterSummaries?.totalCount || 0,
            pageSize: pages.first,
            onChange(page, pageSize) {
              setPages({
                current: page,
                first: pageSize,
                offset: pageSize * (page - 1),
              });
            },
          }}
        ></Table>
      </>
    );
  };

  return (
    <div className={styles.myBoostedProjects}>
      <AppPageHeader
        title="My Boosted Projects"
        desc={empty ? undefined : 'Manage the boosts that you are boosting to different projects'}
      />

      {mainRender()}
    </div>
  );
};
export default MyBoostedProjects;
