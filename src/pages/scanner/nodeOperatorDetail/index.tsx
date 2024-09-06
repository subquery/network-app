import React, { FC, useEffect, useMemo, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { DeploymentInfo, DeploymentMeta } from '@components';
import { IndexerName } from '@components/IndexerDetails/IndexerName';
import { useEra, useSortedIndexerDeployments } from '@hooks';
import { CurrentEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { usePrevious } from 'ahooks';
import { Breadcrumb, Button, Input, Select, Table } from 'antd';
import BigNumberJs from 'bignumber.js';
import clsx from 'clsx';

import { formatNumber, formatSQT } from '../../../utils/numberFormatters';
import { RewardsByType } from '../projectDetail/components/rewardsByType/rewardsByType';
import styles from './index.module.less';

interface IProps {}

const ScannerDashboard: FC<IProps> = (props) => {
  const { currentEra } = useEra();
  const { id } = useParams();
  const navigate = useNavigate();

  const indexerRewardsInfos = useQuery<{
    eraIndexerApies: {
      nodes: {
        indexerId: string;
        indexerApy: string;
      }[];
    };
    indexerEraDeploymentRewards: {
      groupedAggregates: {
        sum: {
          allocationRewards: string;
          queryRewards: string;
          totalRewards: string;
        };
        keys: string[];
      }[];
    };
  }>(
    gql`
      query getIndexerRewardsInfos($indexers: [String!], $era: Int!) {
        eraIndexerApies(filter: { eraIdx: { equalTo: $era }, indexerId: { in: $indexers } }) {
          nodes {
            indexerId
            indexerApy
          }
        }

        indexerEraDeploymentRewards(filter: { indexerId: { in: $indexers } }) {
          groupedAggregates(groupBy: INDEXER_ID) {
            sum {
              allocationRewards
              queryRewards
              totalRewards
            }
            keys
          }
        }
      }
    `,
    {
      variables: {
        era: (currentEra.data?.index || 0) - 1,
        indexers: [id],
      },
    },
  );

  // const renderData = useMemo(() => {
  //   return [];
  // }, [indexerRewardsInfos.data]);

  // const previousRenderData = usePrevious(renderData);

  const indexerDeployments = useSortedIndexerDeployments(id || '');

  return (
    <div className={styles.dashboard}>
      <Breadcrumb
        className="darkBreadcrumb"
        items={[
          {
            key: 'explorer',
            title: (
              <Typography variant="medium" type="secondary" style={{ cursor: 'pointer' }}>
                Node Operators
              </Typography>
            ),
            onClick: () => {
              navigate(`/node-operators`);
            },
          },
          {
            key: 'current',
            title: (
              <Typography variant="medium" className="overflowEllipsis" style={{ maxWidth: 300 }}>
                {id}
              </Typography>
            ),
          },
        ]}
      ></Breadcrumb>

      <div className="flex" style={{ gap: 24 }}>
        <div className={clsx(styles.dashboardInner)} style={{ flex: 5, height: 426 }}>
          <div className="flex" style={{ marginBottom: 16 }}>
            <IndexerName address={id || ''} theme="dark" size="large"></IndexerName>
            <span style={{ flex: 1 }}></span>
            <Button type="primary" shape="round" size="large">
              <a href={`https://app.subquery.network/indexer/${id}`} target="_blank" rel="noreferrer">
                Open On Explorer
              </a>
            </Button>
          </div>

          <div className="col-flex" style={{ gap: 12 }}>
            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Project Rewards
              </Typography>

              <Typography>
                {formatNumber(
                  formatSQT(
                    indexerRewardsInfos.data?.indexerEraDeploymentRewards?.groupedAggregates?.[0]?.sum?.totalRewards ||
                      '0',
                  ),
                )}{' '}
                {TOKEN}
              </Typography>
            </div>

            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Projects
              </Typography>

              <Typography>{indexerDeployments.data?.length || 0}</Typography>
            </div>

            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Stake Rewards
              </Typography>

              <Typography>
                {formatNumber(
                  formatSQT(
                    indexerRewardsInfos.data?.indexerEraDeploymentRewards?.groupedAggregates?.[0]?.sum
                      ?.allocationRewards || '0',
                  ),
                )}{' '}
                {TOKEN}
              </Typography>
            </div>

            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Query Rewards
              </Typography>

              <Typography>
                {formatNumber(
                  formatSQT(
                    indexerRewardsInfos.data?.indexerEraDeploymentRewards?.groupedAggregates?.[0]?.sum?.queryRewards ||
                      '0',
                  ),
                )}{' '}
                {TOKEN}
              </Typography>
            </div>
          </div>
        </div>
        <div style={{ flex: 8 }}>
          <RewardsByType indexerAddress={id}></RewardsByType>
        </div>
      </div>

      <div className={styles.dashboardInner}>
        <div className="flex" style={{ marginBottom: 24 }}>
          <Typography variant="large" weight={600}>
            Projects ({indexerDeployments.data?.length || 0})
          </Typography>
        </div>

        <Table
          className={'darkTable'}
          loading={indexerDeployments.loading}
          columns={[
            {
              title: 'ProjectS',
              dataIndex: 'name',
              key: 'name',
              render: (_, record) => {
                return (
                  <DeploymentInfo deploymentId={record.deploymentId} project={record.projectMeta}></DeploymentInfo>
                );
              },
            },
            {
              title: 'Stake',
              dataIndex: 'allocatedAmount',
              key: 'allocatedAmount',
              render: (text: string) => (
                <Typography>
                  {formatNumber(formatSQT(text))} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Last Era Stake Rewards',
              dataIndex: 'lastEraAllocatedRewards',
              key: 'lastEraAllocatedRewards',
              render: (text: string) => (
                <Typography>
                  {formatNumber(formatSQT(text))} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Last Era Query Rewards',
              dataIndex: 'lastEraQueryRewards',
              key: 'lastEraQueryRewards',
              render: (text: string) => (
                <Typography>
                  {formatNumber(formatSQT(text))} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Total Rewards',
              dataIndex: 'totalRewards',
              key: 'totalRewards',
              render: (text: string) => (
                <Typography>
                  {formatNumber(formatSQT(text))} {TOKEN}
                </Typography>
              ),
            },
          ]}
          dataSource={indexerDeployments.data || []}
          pagination={false}
          // pagination={{
          //   total: allIndexers.data?.indexers.totalCount || allIndexers.previousData?.indexers.totalCount,
          //   pageSize: pageInfo.pageSize,
          //   pageSizeOptions: ['10', '30', '50', '100'],
          //   current: pageInfo.currentPage,
          //   onChange(page, pageSize) {
          //     setPageInfo({
          //       pageSize,
          //       currentPage: page,
          //     });
          //   },
          // }}
        ></Table>
      </div>
    </div>
  );
};
export default ScannerDashboard;
