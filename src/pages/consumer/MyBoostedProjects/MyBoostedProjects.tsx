// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
import { AppPageHeader, DeploymentMeta } from '@components';
import DoBooster from '@components/DoBooster';
import { BalanceLayout } from '@pages/dashboard';
import { SubqlCard, Typography } from '@subql/components';
import { formatSQT } from '@subql/react-hooks';
import { formatNumber, TOKEN } from '@utils';
import { Button, Table } from 'antd';
import BigNumberJs from 'bignumber.js';
import { useAccount } from 'wagmi';

import { EmptyList } from '../../../components/EmptyList/EmptyList';
import { retry } from '../../../utils/retry';
import styles from './index.module.less';

const MyBoostedProjects: FC = () => {
  const { address: account } = useAccount();
  const [pages, setPages] = React.useState({
    first: 1,
    offset: 0,
    current: 1,
  });
  const boostedProjects = useQuery(
    gql`
      query GetDeploymentBoosterTotalAmountByDeploymentId($offset: Int = 0, $first: Int = 10, $consumer: String!) {
        deploymentBoosterSummaries(
          filter: { consumer: { equalTo: $consumer } }
          offset: $offset
          first: $first
          orderBy: ID_DESC
        ) {
          nodes {
            consumer
            deploymentId
            totalAmount
            projectId
            project {
              metadata
            }
          }
          totalCount
        }

        totalBoostedAmount: deploymentBoosterSummaries(filter: { consumer: { equalTo: $consumer } }) {
          aggregates {
            sum {
              totalAmount
            }
          }
        }
      }
    `,
    {
      variables: {
        consumer: account,
        ...pages,
      },
      fetchPolicy: 'network-only',
    },
  );

  const existingBoost = useMemo(() => {
    if (boostedProjects.data) {
      return BigNumberJs(boostedProjects.data?.totalBoostedAmount?.aggregates?.sum?.totalAmount || '0').toString();
    }

    if (boostedProjects.previousData) {
      return BigNumberJs(
        boostedProjects.previousData?.totalBoostedAmount?.aggregates?.sum?.totalAmount || '0',
      ).toString();
    }

    return '0';
  }, [boostedProjects.data]);

  const empty = useMemo(() => {
    if (boostedProjects.data) {
      if (boostedProjects.data?.totalBoostedAmount?.aggregates?.sum?.totalAmount !== '0') {
        return false;
      }
    }

    if (boostedProjects.previousData) return false;

    return true;
  }, [boostedProjects.data]);

  return (
    <div className={styles.myBoostedProjects}>
      <AppPageHeader
        title="My Boosted Projects"
        desc={empty ? undefined : 'Manage the boosts that you are boosting to different projects'}
      />

      {empty ? (
        <EmptyList
          title={'You haven’t boosted any projects yet'}
          description="Follow our documentation to help you get boost to a project then head over to the Explorer to find the first project you would like to boost. Learn how to boost a project here"
          infoI18nKey={'emptyList.boostProject'}
          infoLinkDesc={'Learn how to boost a project '}
          infoLink={''} // TODO: fill the link
        >
          <a href="/explorer/home" target="_blank">
            <Button type="primary" shape="round" size="large">
              Boost now
            </Button>
          </a>
        </EmptyList>
      ) : (
        <>
          <SubqlCard
            title="Current Total Boosts"
            tooltip="The total amount that is currently boosted to projects. "
            titleExtra={BalanceLayout({
              mainBalance: formatSQT(existingBoost),
            })}
            width={360}
          ></SubqlCard>

          <Table
            dataSource={boostedProjects.data?.deploymentBoosterSummaries?.nodes || []}
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
                title: 'Action',
                dataIndex: 'deploymentId',
                render: (deploymentId: string, record) => (
                  <div className="flex" style={{ gap: 16 }}>
                    <DoBooster
                      deploymentId={deploymentId}
                      projectId={record.projectId}
                      actionBtn={<Typography.Link active>Add Boost</Typography.Link>}
                      onSuccess={() =>
                        retry(() => {
                          boostedProjects.refetch();
                        })
                      }
                    ></DoBooster>
                    <DoBooster
                      deploymentId={deploymentId}
                      projectId={record.projectId}
                      actionBtn={<Typography type="danger">Remove Boost</Typography>}
                      onSuccess={() =>
                        retry(() => {
                          boostedProjects.refetch();
                        })
                      }
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
      )}
    </div>
  );
};
export default MyBoostedProjects;
