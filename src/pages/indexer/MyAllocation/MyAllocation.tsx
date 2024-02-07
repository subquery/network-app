// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo } from 'react';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { CurEra, DeploymentMeta, Description, WalletRoute } from '@components';
import DoAllocate from '@components/DoAllocate/DoAllocate';
import { SubqlCard, TableText, TableTitle, Typography } from '@subql/components';
import {
  formatSQT,
  useAsyncMemo,
  useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery,
  useGetIndexerAllocationProjectsQuery,
} from '@subql/react-hooks';
import { formatNumber, notEmpty, TOKEN } from '@utils';
import { retry } from '@utils/retry';
import { Table, Tooltip } from 'antd';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';

import { useWeb3Store } from 'src/stores';

import styles from './index.module.less';

const MyAllocation: FC = (props) => {
  const { address: account } = useAccount();
  const { contracts } = useWeb3Store();

  const runnerAllocation = useAsyncMemo(async () => {
    if (!account)
      return {
        used: '0',
        total: '0',
      };
    const res = await contracts?.stakingAllocation.runnerAllocation(account);

    return {
      used: formatSQT(res?.used.toString() || '0'),
      total: formatSQT(res?.total.toString() || '0'),
    };
  }, [account]);

  const isOverAllocate = useMemo(() => {
    if (!runnerAllocation.data?.used || !runnerAllocation.data?.total) return false;
    return +runnerAllocation.data?.used > +runnerAllocation.data?.total;
  }, [runnerAllocation.data?.used, runnerAllocation.data?.total]);

  const allocatedProjects = useGetIndexerAllocationProjectsQuery({
    variables: {
      id: account || '',
    },
  });

  const allocatedRewards = useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery({
    variables: {
      indexerId: account || '',
    },
  });

  return (
    <WalletRoute
      componentMode
      element={
        <div className={styles.myAllocation}>
          <div className="flex">
            <div className="col-flex" style={{ gap: 8 }}>
              <Typography variant="h4" weight={600}>
                My Allocations
              </Typography>
              <Description desc={'Manage the staked allocations that you are allocating to different projects'} />
            </div>
            <span style={{ flex: 1 }}></span>
            <CurEra></CurEra>
          </div>

          <div style={{ margin: '24px 0', display: 'flex', gap: 24 }}>
            <SubqlCard
              title={
                <div className="col-flex" style={{ gap: 8 }}>
                  <Typography
                    variant="small"
                    weight={600}
                    style={{
                      color: isOverAllocate ? 'var(--sq-warning)' : 'var(--sq-gray600)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isOverAllocate ? 'Over Allocations' : 'Total Allocations'}
                    {isOverAllocate && (
                      <Tooltip title="Your current allocation amount exceeds your available stake. Please adjust to align with your available balance. ">
                        <InfoCircleOutlined style={{ marginLeft: 4 }} />
                      </Tooltip>
                    )}
                  </Typography>

                  <Typography variant="h5" weight={600}>{`${BigNumber(
                    runnerAllocation.data?.used || '0',
                  ).toFormat()} ${TOKEN}`}</Typography>
                </div>
              }
              style={{ boxShadow: 'none', minWidth: 260, padding: 4 }}
            />
            <SubqlCard
              title={
                <div className="col-flex" style={{ gap: 8 }}>
                  <Typography
                    variant="small"
                    weight={600}
                    style={{
                      color: 'var(--sq-gray600)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Total Allocation REWARDS
                    <Tooltip title="The total amount of rewards earned by allocation staking">
                      <InfoCircleOutlined style={{ marginLeft: 4 }} />
                    </Tooltip>
                  </Typography>

                  <Typography variant="h5" weight={600}>{`${formatNumber(
                    formatSQT(
                      allocatedRewards.data?.indexerAllocationRewards?.groupedAggregates
                        ?.reduce((cur, add) => cur.plus(add.sum?.reward.toString() || '0'), BigNumber(0))
                        .toString() || '0',
                    ),
                  )} ${TOKEN}`}</Typography>
                </div>
              }
              style={{ boxShadow: 'none', minWidth: 260, padding: 4 }}
            />
          </div>

          <Table
            loading={allocatedProjects.loading}
            dataSource={allocatedProjects.data?.indexerAllocationSummaries?.nodes.filter(notEmpty) || []}
            rowKey={(record) => record.deploymentId}
            columns={[
              {
                title: <TableTitle>#</TableTitle>,
                render(value, record, index) {
                  return <TableText>{index + 1}</TableText>;
                },
              },
              {
                title: <TableTitle>Project</TableTitle>,
                dataIndex: 'deploymentId',
                render(value, record) {
                  return (
                    <DeploymentMeta
                      deploymentId={value}
                      projectMetadata={record.deployment?.project?.metadata}
                    ></DeploymentMeta>
                  );
                },
              },
              {
                title: <TableTitle>Allocated Amount</TableTitle>,
                dataIndex: 'totalAmount',
                render(value) {
                  return (
                    <TableText>
                      {formatNumber(formatSQT(value))} {TOKEN}
                    </TableText>
                  );
                },
              },
              {
                title: <TableTitle>Total Rewards</TableTitle>,
                dataIndex: 'deploymentId',
                render(value) {
                  const rewards = allocatedRewards.data?.indexerAllocationRewards?.groupedAggregates?.find(
                    (i) => i.keys?.[0] === value,
                  );
                  const totalRewards = rewards?.sum?.reward;
                  return (
                    <TableText>
                      {formatNumber(formatSQT(totalRewards?.toString() || '0'))} {TOKEN}
                    </TableText>
                  );
                },
              },
              {
                title: <TableTitle>Action</TableTitle>,
                dataIndex: 'deploymentId',
                render(value, record) {
                  return (
                    <DoAllocate
                      deploymentId={value}
                      projectId={record.proejctId}
                      actionBtn={
                        <Typography.Link active variant="medium">
                          Update
                        </Typography.Link>
                      }
                      onSuccess={() => {
                        runnerAllocation.refetch();
                        retry(allocatedProjects.refetch);
                      }}
                    ></DoAllocate>
                  );
                },
              },
            ]}
          ></Table>
        </div>
      }
    ></WalletRoute>
  );
};
export default MyAllocation;
