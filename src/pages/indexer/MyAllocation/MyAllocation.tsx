// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { Card, DeploymentMeta, Description, WalletRoute } from '@components';
import DoAllocate from '@components/DoAllocate/DoAllocate';
import { TableText, TableTitle, Typography } from '@subql/components';
import {
  formatSQT,
  useAsyncMemo,
  useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery,
  useGetIndexerAllocationProjectsQuery,
} from '@subql/react-hooks';
import { formatNumber, notEmpty, TOKEN } from '@utils';
import { retry } from '@utils/retry';
import { Table } from 'antd';
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
      };
    const res = await contracts?.stakingAllocation.runnerAllocation(account);

    return {
      used: formatSQT(res?.used.toString() || '0'),
    };
  }, [account]);

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
          <Typography variant="h4" weight={600}>
            My Allocations
          </Typography>
          <Description desc={'Manage the staked allocations that you are allocating to different projects'} />

          <div style={{ margin: '24px 0', display: 'flex', gap: 24 }}>
            <Card
              title={'Total Allocations'}
              value={`${BigNumber(runnerAllocation.data?.used || '0').toFormat()} ${TOKEN}`}
            />
            <Card
              title={'Total Allocation REWARDS'}
              value={`${formatNumber(
                formatSQT(
                  allocatedRewards.data?.indexerAllocationRewards?.groupedAggregates
                    ?.reduce((cur, add) => cur.plus(add.sum?.reward.toString() || '0'), BigNumber(0))
                    .toString() || '0',
                ),
              )} ${TOKEN}`}
            />
          </div>

          <Table
            loading={allocatedProjects.loading}
            dataSource={allocatedProjects.data?.indexerAllocationSummaries?.nodes.filter(notEmpty) || []}
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
