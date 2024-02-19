// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import { BalanceLayout } from '@pages/dashboard';
import { Spinner, SubqlCard, SubqlProgress, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { ServiceStatus } from '@subql/network-query';
import {
  formatSQT,
  mergeAsync,
  useAsyncMemo,
  useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery,
} from '@subql/react-hooks';
import { getDeploymentStatus } from '@utils/getIndexerStatus';
import { Table, TableProps, Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { DeploymentInfo, Status } from '../../../../components';
import { Description } from '../../../../components/Description/Description';
import { deploymentStatus } from '../../../../components/Status/Status';
import {
  useIsIndexer,
  useSortedIndexer,
  useSortedIndexerDeployments,
  UseSortedIndexerDeploymentsReturn,
} from '../../../../hooks';
import { formatNumber, renderAsync, TOKEN, truncateToDecimalPlace } from '../../../../utils';
import { ROUTES } from '../../../../utils';
import styles from './OwnDeployments.module.css';

const { PROJECT_NAV } = ROUTES;

interface Props {
  indexer: string;
  emptyList?: React.ReactNode;
  desc?: string | React.ReactNode;
}

export const OwnDeployments: React.FC<Props> = ({ indexer, emptyList, desc }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const indexerDeployments = useSortedIndexerDeployments(indexer);
  const isIndexer = useIsIndexer(indexer);
  const sortedIndexer = useSortedIndexer(indexer || '');
  const { contracts } = useWeb3Store();

  const allocatedRewards = useGetAllocationRewardsByDeploymentIdAndIndexerIdQuery({
    variables: {
      indexerId: indexer || '',
    },
  });

  const runnerAllocation = useAsyncMemo(async () => {
    if (!indexer)
      return {
        used: '0',
        total: '0',
        left: '0',
      };
    const res = await contracts?.stakingAllocation.runnerAllocation(indexer);

    return {
      used: formatSQT(res?.used.toString() || '0'),
      total: formatSQT(res?.total.toString() || '0'),
      left: formatSQT(res?.total.sub(res.used).toString() || '0'),
    };
  }, [indexer]);

  const isOverAllocate = React.useMemo(() => {
    if (!runnerAllocation.data?.used || !runnerAllocation.data?.total) return false;
    return +runnerAllocation.data?.used > +runnerAllocation.data?.total;
  }, [runnerAllocation.data?.used, runnerAllocation.data?.total]);

  const columns: TableProps<UseSortedIndexerDeploymentsReturn>['columns'] = [
    {
      title: 'Project',
      dataIndex: 'deploymentId',
      render: (deploymentId: string, deployment) => (
        <DeploymentInfo deploymentId={deploymentId} project={deployment.projectMeta} />
      ),
    },
    {
      width: '100%',
      title: <TableTitle title={t('general.status')} />,
      dataIndex: 'indexingProgress',
      render: (indexingProgress: number, deployment) => {
        // TODO: will use metric service replace it. hardcode for now.
        const sortedStatus = getDeploymentStatus(deployment.status as ServiceStatus, false);

        const { indexingErr } = deployment;
        if (indexingErr)
          return (
            <div>
              <Typography type="danger">Error: </Typography> <Typography type="secondary">{indexingErr}</Typography>
            </div>
          );
        return (
          <div>
            <div>
              <Typography variant="medium" style={{ marginRight: 8 }}>
                {truncateToDecimalPlace(indexingProgress, 2) * 100} %
              </Typography>
              <Status text={sortedStatus} color={deploymentStatus[sortedStatus]} />
            </div>
            <Typography type="secondary" variant="small">
              Current blocks: #{deployment.lastHeight}
            </Typography>
          </div>
        );
      },
    },
    {
      title: <TableTitle title={t('general.status')} />,
      dataIndex: 'status',
      render: (status, deployment) => {
        // TODO: will use metric service replace it. hardcode for now.
        const sortedStatus = getDeploymentStatus(status, false);
        return <Status text={sortedStatus} color={deploymentStatus[sortedStatus]} />;
      },
    },
  ];

  const sortedDesc = typeof desc === 'string' ? <Description desc={desc} /> : desc;

  return (
    <div className={styles.container}>
      {renderAsync(
        mergeAsync(indexerDeployments, isIndexer, sortedIndexer, runnerAllocation),

        {
          error: (error) => <Typography type="danger">{`Failed to get projects: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          data: (data) => {
            const [indexerDepolymentsData, isIndexerData, sortedIndexerData, runnerAllocationData] = data;

            if (
              !isIndexerData ||
              (!sortedIndexerData && (!indexerDepolymentsData || indexerDepolymentsData.length === 0))
            ) {
              return <>{emptyList ?? <Typography> {t('projects.nonDeployments')} </Typography>}</>;
            }

            const sortedData = indexerDepolymentsData?.sort((deployment) => (deployment.isOffline ? 1 : -1));

            return (
              <>
                {sortedDesc && <div className={styles.desc}>{sortedDesc}</div>}
                <div style={{ display: 'flex', gap: 24 }}>
                  <SubqlCard
                    title={
                      <div style={{ width: '100%' }}>
                        <div>
                          <Typography>Current Total Stake</Typography>
                          <Tooltip title="This is the total staked amount right now. This includes SQT that has been delegated to you">
                            <InfoCircleOutlined style={{ marginLeft: 4, color: 'var(--sq-gray500)' }} />
                          </Tooltip>
                        </div>

                        <div>
                          {BalanceLayout({
                            mainBalance: BigNumber.from(sortedIndexerData?.totalStake.current).toString(),
                            secondaryBalance: BigNumber.from(sortedIndexerData?.totalStake.after).toString(),
                          })}
                        </div>

                        <div
                          style={{
                            width: '100%',
                            height: 12,
                            borderRadius: 4,
                            background: 'var(--sq-warning)',
                            margin: '12px 0 20px 0',
                          }}
                        ></div>

                        <div style={{ display: 'flex', gap: 53 }}>
                          {[
                            {
                              name: 'Own Stake',
                              color: 'var(--sq-blue600)',
                              currentBalance: formatNumber(
                                BigNumber.from(sortedIndexerData?.ownStake.current).toString(),
                              ),
                              afterBalance: formatNumber(BigNumber.from(sortedIndexerData?.ownStake.after).toString()),
                            },
                            {
                              name: 'Total Delegation',
                              color: 'var(--sq-success)',
                              currentBalance: formatNumber(
                                BigNumber.from(sortedIndexerData?.totalDelegations.current).toString(),
                              ),
                              afterBalance: formatNumber(
                                BigNumber.from(sortedIndexerData?.totalDelegations.after).toString(),
                              ),
                            },
                            {
                              name: isOverAllocate ? 'Over Allocated' : 'Unallocated Stake',
                              color: 'var(--sq-warning)',
                              currentBalance: formatNumber(runnerAllocationData?.left || '0'),
                              afterBalance: formatNumber(runnerAllocationData?.left || '0'),
                              isOverAllocate: isOverAllocate,
                            },
                          ].map((item) => {
                            return (
                              <div style={{ display: 'flex', alignItems: 'baseline' }} key={item.name}>
                                <div
                                  style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: 2,
                                    background: item.color,
                                  }}
                                ></div>
                                <Typography variant="medium" style={{ margin: '0 4px' }}>
                                  {item.name}
                                </Typography>
                                <div className="col-flex" style={{ alignItems: 'flex-end' }}>
                                  <Typography variant="medium">
                                    {item.currentBalance} {TOKEN}
                                    {item.isOverAllocate && (
                                      <Tooltip title="Your current allocation amount exceeds your available stake. Please adjust to align with your available balance. ">
                                        <WarningOutlined style={{ marginLeft: 4, color: 'var(--sq-error)' }} />
                                      </Tooltip>
                                    )}
                                  </Typography>
                                  {!item.isOverAllocate && (
                                    <Typography type="secondary" variant="small">
                                      {item.afterBalance} {TOKEN}
                                    </Typography>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    }
                    style={{ boxShadow: 'none', marginBottom: 24, flex: 1 }}
                  ></SubqlCard>

                  <SubqlCard
                    title={
                      <div>
                        <Typography>Current Total Allocation</Typography>
                      </div>
                    }
                    titleExtra={BalanceLayout({
                      mainBalance: formatNumber(runnerAllocationData?.used || '0'),
                    })}
                    style={{ boxShadow: 'none', marginBottom: 24, flex: 1 }}
                  >
                    <div className="flex">
                      <Typography>Total Allocation Rewards</Typography>
                      <span style={{ flex: 1 }}></span>
                      <Typography>
                        {formatNumber(
                          formatSQT(
                            allocatedRewards.data?.indexerAllocationRewards?.groupedAggregates
                              ?.reduce((cur, add) => cur.plus(add.sum?.reward.toString() || '0'), BigNumberJs(0))
                              .toString() || '0',
                          ),
                        )}{' '}
                        {TOKEN}
                      </Typography>
                    </div>
                  </SubqlCard>
                </div>
                <Table
                  columns={columns}
                  dataSource={sortedData}
                  rowKey={'deploymentId'}
                  onRow={(record) => {
                    return {
                      onClick: (_) => {
                        if (record.projectId) {
                          navigate(`${PROJECT_NAV}/${record.projectId}/overview`);
                        }
                      },
                    };
                  }}
                />
              </>
            );
          },
        },
      )}
    </div>
  );
};
