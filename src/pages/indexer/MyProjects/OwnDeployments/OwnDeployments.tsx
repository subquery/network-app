// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import { gql, useLazyQuery } from '@apollo/client';
import { APYTooltip } from '@components/APYTooltip';
import { DeploymentInfo } from '@components/DeploymentInfo';
import { Description } from '@components/Description';
import DoAllocate from '@components/DoAllocate/DoAllocate';
import Status from '@components/Status';
import { deploymentStatus } from '@components/Status/Status';
import { BalanceLayout } from '@pages/dashboard';
import { DoStake } from '@pages/indexer/MyStaking/DoStake';
import { Spinner, SubqlCard, Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { formatSQT, mergeAsync, useAsyncMemo } from '@subql/react-hooks';
import { getDeploymentStatus } from '@utils/getIndexerStatus';
import { usePrevious, useSize } from 'ahooks';
import { Table, TableProps, Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';

import { useWeb3Store } from 'src/stores';

import {
  DeploymentStatus,
  useEra,
  useIsIndexer,
  useSortedIndexer,
  useSortedIndexerDeployments,
  UseSortedIndexerDeploymentsReturn,
} from '../../../../hooks';
import { formatNumber, numToHex, renderAsync, TOKEN, truncateToDecimalPlace } from '../../../../utils';
import { ROUTES } from '../../../../utils';
import { formatEther } from '../../../../utils/numberFormatters';
import AutoReduceAllocation from '../AutoReduceOverAllocation';
import CurrentEraRewards from '../CurrentEraRewards/index';
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
  const { width } = useSize(document.querySelector('body')) || { width: 0 };
  const indexerDeployments = useSortedIndexerDeployments(indexer);
  const isIndexer = useIsIndexer(indexer);
  const sortedIndexer = useSortedIndexer(indexer || '');
  const { contracts } = useWeb3Store();
  const { currentEra } = useEra();

  const [fetchIndexerDeploymentApy, indexerDeploymentApy] = useLazyQuery(gql`
    query GetDeploymentApy($account: String!, $eraIdx: Int!, $deploymentIds: [String!]) {
      eraIndexerDeploymentApies(
        filter: { indexerId: { equalTo: $account }, eraIdx: { equalTo: $eraIdx }, deploymentId: { in: $deploymentIds } }
      ) {
        nodes {
          apy
          deploymentId
          indexerId
        }
      }
    }
  `);

  const [fetchIndexerLastEraRewardsInfo, indexerLastEraRewardsInfo] = useLazyQuery<{
    indexerEraDeploymentRewards: {
      aggregates: {
        sum: {
          allocationRewards: string;
          queryRewards: string;
          totalRewards: string;
        };
      };
    };
    indexerAllocationRewards: {
      aggregates: {
        sum: {
          burnt: string;
          reward: string;
        };
      };
    };
  }>(gql`
    query GetIndexerLastEraRewardsInfo($indexer: String!, $eraIdx: Int!) {
      indexerEraDeploymentRewards(filter: { indexerId: { equalTo: $indexer }, eraIdx: { equalTo: $eraIdx } }) {
        aggregates {
          sum {
            allocationRewards
            queryRewards
            totalRewards
          }
        }
      }

      indexerAllocationRewards(filter: { indexerId: { equalTo: $indexer }, eraIdx: { equalTo: $eraIdx } }) {
        aggregates {
          sum {
            burnt
            reward
          }
        }
      }
    }
  `);

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
  const previousRunnerAllocation = usePrevious(runnerAllocation.data);

  const isOverAllocate = React.useMemo(() => {
    if (!runnerAllocation.data?.used || !runnerAllocation.data?.total) return false;
    return +runnerAllocation.data?.used > +runnerAllocation.data?.total;
  }, [runnerAllocation.data?.used, runnerAllocation.data?.total]);

  const sortedData = React.useMemo(() => {
    return indexerDeployments.data
      ?.map((i) => {
        const find = indexerDeploymentApy.data?.eraIndexerDeploymentApies?.nodes?.find(
          (item: { apy: string; deploymentId: string }) => item.deploymentId === i.deploymentId,
        );
        return {
          ...i,
          deploymentApy: BigNumberJs(formatEther(find?.apy || '0')).multipliedBy(100),
        };
      })
      .sort((a, b) => {
        if (a.status === DeploymentStatus.Unhealthy) return -1;
        return 1;
      });
  }, [indexerDeployments.data, indexerDeploymentApy.data]);

  const previousSortedData = usePrevious(sortedData);

  const columns: TableProps<UseSortedIndexerDeploymentsReturn & { deploymentApy: BigNumberJs }>['columns'] = [
    {
      width: 200,
      title: 'Project',
      dataIndex: 'deploymentId',
      render: (deploymentId: string, deployment) => (
        <DeploymentInfo
          deploymentId={deploymentId}
          project={deployment.projectMeta}
          onClick={() => {
            if (deployment.projectId) {
              navigate(`${PROJECT_NAV}/${deployment.projectId}/overview?deploymentId=${deploymentId}`);
            }
          }}
        />
      ),
    },
    {
      width: 150,
      title: <TableTitle title={t('general.status')} />,
      dataIndex: 'indexingProgress',
      render: (indexingProgress: number, deployment) => {
        // TODO: will use metric service replace it. hardcode for now.
        const sortedStatus = deployment.status ? getDeploymentStatus(deployment.status, false) : 'NOTINDEXING';

        const { indexingErr } = deployment;

        if (indexingErr)
          return (
            <div>
              <Typography type="danger">Error: </Typography> <Typography type="secondary">{indexingErr}</Typography>
            </div>
          );
        return (
          <div>
            <Tooltip title={deployment.unhealthyReason}>
              <div>
                <Typography variant="medium" style={{ marginRight: 8 }}>
                  {truncateToDecimalPlace(indexingProgress * 100, 2)} %
                </Typography>
                <Status text={sortedStatus} color={deploymentStatus[sortedStatus]} />
              </div>
              {deployment.lastHeight ? (
                <Typography type="secondary" variant="small">
                  Current blocks: #{deployment.lastHeight}
                </Typography>
              ) : (
                ''
              )}
            </Tooltip>
          </div>
        );
      },
      sorter: (a, b) => {
        if (a.status === DeploymentStatus.Unhealthy) return -1;
        return 1;
      },
    },
    {
      width: 150,
      title: (
        <Typography
          weight={600}
          variant="small"
          type="secondary"
          className="flex-center"
          style={{ textTransform: 'uppercase' }}
        >
          Previous Estimated APY
          <APYTooltip
            currentEra={currentEra?.data?.index}
            calculationDescription={
              'This is the estimated APY you received as a Node Operator from this project from the last Era'
            }
          />
        </Typography>
      ),
      dataIndex: 'deploymentApy',
      render: (deploymentApy) => {
        return <Typography>{deploymentApy.toFixed(2)} %</Typography>;
      },
      sorter: (a, b) => {
        return BigNumberJs(a.deploymentApy || '0').comparedTo(b.deploymentApy || '0');
      },
    },
    {
      width: 150,
      title: <TableTitle title="Allocated amount" />,
      dataIndex: 'allocatedAmount',
      render: (allocatedAmount: string) => {
        return (
          <Typography>
            {formatNumber(formatSQT(allocatedAmount || '0'))} {TOKEN}
          </Typography>
        );
      },
      sorter: (a, b) => {
        return BigNumberJs(a.allocatedAmount || '0').comparedTo(b.allocatedAmount || '0');
      },
    },
    {
      width: 150,
      title: <TableTitle title="LAST ERA ALLOCATION REWARDS" />,
      dataIndex: 'lastEraAllocatedRewards',
      render: (lastEraAllocatedRewards) => {
        return (
          <Typography>
            {formatNumber(formatSQT(lastEraAllocatedRewards || '0'))} {TOKEN}
          </Typography>
        );
      },
      sorter: (a, b) => {
        return BigNumberJs(a.lastEraAllocatedRewards || '0').comparedTo(b.lastEraAllocatedRewards || '0');
      },
    },
    {
      width: 150,
      title: <TableTitle title="LAST ERA QUERY REWARDS" />,
      dataIndex: 'lastEraQueryRewards',
      render: (lastEraQueryRewards) => {
        return (
          <Typography>
            {formatNumber(formatSQT(lastEraQueryRewards || '0'))} {TOKEN}
          </Typography>
        );
      },
      sorter: (a, b) => {
        return BigNumberJs(a.lastEraQueryRewards || '0').comparedTo(b.lastEraQueryRewards || '0');
      },
    },
    {
      width: 150,
      title: <TableTitle title="LAST ERA BURNED REWARDS" />,
      dataIndex: 'lastEraBurnt',
      render: (lastEraBurnt, deployment) => {
        const haveBurnt = !BigNumberJs(lastEraBurnt || '0').isZero();
        const percentageOfBurnt = BigNumberJs(lastEraBurnt || '0')
          .div(BigNumberJs(deployment.lastEraAllocatedRewards || '0').plus(lastEraBurnt || '0'))
          .multipliedBy(100)
          .toFixed(2);
        return (
          <Typography type={haveBurnt ? 'danger' : 'default'} className="col-flex">
            {formatNumber(formatSQT(lastEraBurnt || '0'))} {TOKEN}
            {haveBurnt ? (
              <Typography variant="small" type="secondary">
                {percentageOfBurnt}% of rewards
              </Typography>
            ) : null}
          </Typography>
        );
      },
      sorter: (a, b) => {
        return BigNumberJs(a.lastEraBurnt || '0').comparedTo(b.lastEraBurnt || '0');
      },
    },
    {
      width: 150,
      title: <TableTitle title="Total Rewards" />,
      dataIndex: 'totalRewards',
      render: (totalRewards) => {
        return (
          <Typography>
            {formatNumber(formatSQT(totalRewards || '0'))} {TOKEN}
          </Typography>
        );
      },
      sorter: (a, b) => {
        return BigNumberJs(a.totalRewards || '0').comparedTo(b.totalRewards || '0');
      },
    },
    {
      width: 150,
      title: <TableTitle title={t('general.action')} />,
      dataIndex: 'status',
      fixed: 'right',
      render: (status, deployment) => {
        return (
          <div style={{ display: 'flex', gap: 26 }}>
            <DoAllocate
              deploymentId={deployment.deploymentId}
              projectId={deployment.projectId}
              actionBtn={<Typography.Link type="info">Add Allocation</Typography.Link>}
              onSuccess={async () => {
                await Promise.all([indexerDeployments.refetch?.(), runnerAllocation.refetch()]);
              }}
              initialStatus="Add"
            ></DoAllocate>

            <DoAllocate
              deploymentId={deployment.deploymentId}
              projectId={deployment.projectId}
              disabled={deployment.allocatedAmount === '0' || !deployment.allocatedAmount}
              actionBtn={
                <Typography.Link
                  type={deployment.allocatedAmount === '0' || !deployment.allocatedAmount ? 'default' : 'danger'}
                  disabled={deployment.allocatedAmount === '0' || !deployment.allocatedAmount}
                >
                  Remove Allocation
                </Typography.Link>
              }
              onSuccess={async () => {
                await Promise.all([indexerDeployments.refetch?.(), runnerAllocation.refetch()]);
              }}
              initialStatus="Remove"
            ></DoAllocate>
          </div>
        );
      },
    },
  ];

  const sortedDesc = typeof desc === 'string' ? <Description desc={desc} /> : desc;

  React.useEffect(() => {
    if (indexer && currentEra.data?.index && indexerDeployments?.data?.length) {
      fetchIndexerDeploymentApy({
        variables: {
          account: indexer || '',
          eraIdx: (currentEra.data?.index || 0) - 1,
          deploymentIds: indexerDeployments.data?.map((item) => item.deploymentId) || [],
        },
      });

      fetchIndexerLastEraRewardsInfo({
        variables: {
          // id: `${indexer}:${numToHex(currentEra.data?.index - 1)}`,
          indexer: indexer,
          eraIdx: currentEra.data?.index - 1,
        },
      });
    }
  }, [indexer, currentEra.data?.index, indexerDeployments.data]);

  return (
    <div className={styles.container}>
      {renderAsync(
        {
          ...mergeAsync(indexerDeployments, isIndexer, sortedIndexer, runnerAllocation),
          ...{
            loading: isIndexer.loading || sortedIndexer.loading,
          },
        },

        {
          error: (error) => <Typography type="danger">{`Failed to get projects: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          data: (data) => {
            const [indexerDepolymentsData, isIndexerData, sortedIndexerData, runnerAllocationData] = data;

            if (!isIndexerData || !sortedIndexerData) {
              return <>{emptyList ?? <Typography> {t('projects.nonDeployments')} </Typography>}</>;
            }

            // stake
            const totalStake = BigNumberJs(sortedIndexerData?.ownStake.current || 0).plus(
              BigNumberJs(sortedIndexerData?.totalDelegations.current || 0),
            );
            const ownStakeRatio = BigNumberJs(sortedIndexerData?.ownStake.current || 0).div(totalStake);
            const renderLineData = {
              ownStake: ownStakeRatio.multipliedBy(100).toFixed(2),
              delegation: BigNumberJs(1).minus(ownStakeRatio).multipliedBy(100).toFixed(2),
            };

            // allocation
            const unallocatedStakeRatio = BigNumberJs(runnerAllocationData?.left || 0).div(
              runnerAllocationData?.total || 0,
            );
            const allocatedStakeRatio = BigNumberJs(1).minus(unallocatedStakeRatio);
            const allocationRenderLineData = {
              unAllocation: unallocatedStakeRatio.multipliedBy(100).toFixed(2),
              allocation: allocatedStakeRatio.multipliedBy(100).toFixed(2),
            };

            // last era rewards
            // const lastTotalRewards = BigNumberJs(indexerLastEraRewardsInfo.data?.indexerReward?.amount || 0);
            const lastTotalRewards = BigNumberJs(
              indexerLastEraRewardsInfo.data?.indexerEraDeploymentRewards.aggregates.sum.totalRewards || 0,
            );
            const lastAllocationRewards = BigNumberJs(
              indexerLastEraRewardsInfo.data?.indexerEraDeploymentRewards?.aggregates?.sum?.allocationRewards || 0,
            );
            const lastQueryRewards = lastTotalRewards.minus(lastAllocationRewards);
            const lastAllocationBurnt = BigNumberJs(
              indexerLastEraRewardsInfo.data?.indexerAllocationRewards?.aggregates?.sum?.burnt || 0,
            );
            const totalRatio = lastTotalRewards.plus(lastAllocationBurnt);
            const rewardsRenderLineData = {
              allocationRewards: lastAllocationRewards.div(totalRatio).multipliedBy(100).toFixed(2),
              queryRewards: lastQueryRewards.div(totalRatio).multipliedBy(100).toFixed(2),
              burnt: lastAllocationBurnt.div(totalRatio).multipliedBy(100).toFixed(2),
            };
            return (
              <>
                {sortedDesc && <div className={styles.desc}>{sortedDesc}</div>}
                <div className={styles.info}>
                  <SubqlCard
                    title={'Current Total Stake'}
                    tooltip="This is the total staked amount right now. This includes SQT that has been delegated to you"
                    className={styles.totalStake}
                    titleExtra={BalanceLayout({
                      mainBalance: BigNumberJs(sortedIndexerData?.totalStake.current.toString()).toString(),
                      secondaryBalance: BigNumberJs(sortedIndexerData?.totalStake.after?.toString() || '0').toString(),
                    })}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 12,
                        margin: '12px 0 20px 0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: `${renderLineData.ownStake}%`,
                          height: '100%',
                          background: 'var(--sq-blue600)',
                        }}
                      ></div>
                      <div
                        style={{
                          width: `${renderLineData.delegation}%`,
                          height: '100%',
                          background: 'var(--sq-success)',
                        }}
                      ></div>
                    </div>

                    <div className={styles.stakeInfo}>
                      {[
                        {
                          name: 'Own Stake',
                          color: 'var(--sq-blue600)',
                          currentBalance: formatNumber(
                            BigNumberJs(sortedIndexerData?.ownStake.current.toString()).toString(),
                          ),
                          afterBalance: formatNumber(
                            BigNumberJs(sortedIndexerData?.ownStake.after?.toString() || '0').toString(),
                          ),
                        },
                        {
                          name: 'Total Delegation',
                          color: 'var(--sq-success)',
                          currentBalance: formatNumber(
                            BigNumberJs(sortedIndexerData?.totalDelegations.current.toString()).toString(),
                          ),
                          afterBalance: formatNumber(
                            BigNumberJs(sortedIndexerData?.totalDelegations.after?.toString() || '0').toString(),
                          ),
                        },
                      ].map((item) => {
                        return (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                            key={item.name}
                          >
                            <Typography
                              variant="medium"
                              style={{ marginRight: 4, display: 'flex', alignItems: 'baseline' }}
                            >
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: 2,
                                  background: item.color,
                                  marginRight: 4,
                                }}
                              ></div>
                              {item.name}
                            </Typography>
                            <div className="col-flex" style={{ alignItems: 'flex-end' }}>
                              <Typography variant="medium">
                                {item.currentBalance} {TOKEN}
                              </Typography>
                              <Typography type="secondary" variant="small">
                                {item.afterBalance} {TOKEN}
                              </Typography>
                            </div>
                          </div>
                        );
                      })}
                      <DoStake
                        onSuccess={async () => {
                          await sortedIndexer?.refresh?.();
                        }}
                      ></DoStake>
                    </div>
                  </SubqlCard>

                  <SubqlCard
                    title={
                      <div>
                        <Typography>Current Total Allocation</Typography>
                      </div>
                    }
                    titleExtra={BalanceLayout({
                      mainBalance: formatNumber(
                        runnerAllocation.loading
                          ? previousRunnerAllocation?.used || '0'
                          : runnerAllocationData?.used || '0',
                      ),
                    })}
                    style={{ boxShadow: 'none', marginBottom: 24, flex: 1 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 12,
                        margin: '12px 0 20px 0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: `${allocationRenderLineData.allocation}%`,
                          height: '100%',
                          background: 'var(--sq-blue600)',
                        }}
                      ></div>
                      <div
                        style={{
                          width: `${allocationRenderLineData.unAllocation}%`,
                          height: '100%',
                          background: 'var(--sq-warning)',
                        }}
                      ></div>
                    </div>

                    <div className={styles.stakeInfo}>
                      {[
                        {
                          name: 'Allocated Stake',
                          color: 'var(--sq-blue600)',
                          currentBalance: formatNumber(BigNumberJs(runnerAllocationData?.used || 0).toString()),
                        },
                        {
                          name: isOverAllocate ? 'Over Allocated' : 'Unallocated Stake',
                          color: 'var(--sq-warning)',
                          currentBalance: formatNumber(
                            BigNumberJs(runnerAllocationData?.left || 0)
                              .abs()
                              .toString(),
                          ),
                          rawValue: BigNumberJs(runnerAllocationData?.left || 0)
                            .abs()
                            .toFixed(18),
                          isOverAllocate: isOverAllocate,
                        },
                      ].map((item) => {
                        return (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                            key={item.name}
                          >
                            <Typography
                              variant="medium"
                              style={{ marginRight: 4, display: 'flex', alignItems: 'baseline' }}
                            >
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: 2,
                                  background: item.color,
                                  marginRight: 4,
                                }}
                              ></div>
                              {item.name}
                            </Typography>
                            <div className="col-flex" style={{ alignItems: 'flex-end' }}>
                              <Typography variant="medium">
                                <Tooltip title={item.rawValue ? item.rawValue : ''}>
                                  {item.currentBalance} {TOKEN}
                                </Tooltip>
                                {item.isOverAllocate && (
                                  <Tooltip title="Your current allocation amount exceeds your available stake. Please adjust to align with your available balance. ">
                                    <WarningOutlined style={{ marginLeft: 4, color: 'var(--sq-error)' }} />
                                  </Tooltip>
                                )}
                              </Typography>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SubqlCard>

                  <SubqlCard
                    title={'Last Era Project Rewards'}
                    tooltip="Rewards earned by all projects in the previous era, distributed between Delegators and the Node Operator"
                    titleExtra={BalanceLayout({
                      mainBalance: formatSQT(lastTotalRewards.toString()),
                    })}
                    style={{ boxShadow: 'none', marginBottom: 24, flex: 1 }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 12,
                        margin: '12px 0 20px 0',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: `${rewardsRenderLineData.allocationRewards}%`,
                          height: '100%',
                          background: 'var(--sq-blue600)',
                        }}
                      ></div>
                      <div
                        style={{
                          width: `${rewardsRenderLineData.queryRewards}%`,
                          height: '100%',
                          background: 'var(--sq-success)',
                        }}
                      ></div>
                      <div
                        style={{
                          width: `${rewardsRenderLineData.burnt}%`,
                          height: '100%',
                          background: 'var(--sq-warning)',
                        }}
                      ></div>
                    </div>

                    <div className={styles.stakeInfo}>
                      {[
                        {
                          name: 'Allocation Rewards',
                          color: 'var(--sq-blue600)',
                          currentBalance: formatNumber(formatSQT(lastAllocationRewards.toString() || '0').toString()),
                        },
                        {
                          name: 'Query Rewards',
                          color: 'var(--sq-success)',
                          currentBalance: formatNumber(formatSQT(lastQueryRewards.toString() || '0').toString()),
                        },
                        {
                          name: 'Burned Rewards',
                          color: 'var(--sq-warning)',
                          currentBalance: formatNumber(formatSQT(lastAllocationBurnt.toString() || '0').toString()),
                        },
                      ].map((item) => {
                        return (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'baseline',
                              width: '100%',
                              justifyContent: 'space-between',
                            }}
                            key={item.name}
                          >
                            <Typography
                              variant="medium"
                              style={{ marginRight: 4, display: 'flex', alignItems: 'baseline' }}
                            >
                              <div
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: 2,
                                  background: item.color,
                                  marginRight: 4,
                                }}
                              ></div>
                              {item.name}
                            </Typography>
                            <div className="col-flex" style={{ alignItems: 'flex-end' }}>
                              <Typography variant="medium">
                                {item.currentBalance} {TOKEN}
                              </Typography>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </SubqlCard>
                </div>

                <AutoReduceAllocation></AutoReduceAllocation>
                {!indexerDeployments.loading && (!indexerDepolymentsData || indexerDepolymentsData.length === 0) ? (
                  <>{emptyList ?? <Typography> {t('projects.nonDeployments')} </Typography>}</>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={indexerDeployments.loading ? previousSortedData : sortedData}
                    rowKey={'deploymentId'}
                    pagination={false}
                    expandable={{
                      expandedRowRender: (record) => (
                        <CurrentEraRewards
                          indexerAddress={indexer}
                          deploymentId={record.deployment?.id || record.deploymentId || ''}
                        ></CurrentEraRewards>
                      ),
                    }}
                    scroll={width <= 2260 ? { x: 2260 } : undefined}
                    loading={indexerDeployments.loading}
                  />
                )}
              </>
            );
          },
        },
      )}
    </div>
  );
};
