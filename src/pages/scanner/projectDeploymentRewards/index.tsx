import React, { FC, useEffect, useMemo, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { gql, useQuery } from '@apollo/client';
import { DeploymentMeta } from '@components';
import { useEra } from '@hooks';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { usePrevious } from 'ahooks';
import { Button, Input, Select, Table } from 'antd';
import BigNumberJs from 'bignumber.js';

import { formatNumber, formatSQT } from '../../../utils/numberFormatters';
import styles from './index.module.less';

interface IProps {}

const ScannerDashboard: FC<IProps> = (props) => {
  const { currentEra } = useEra();
  const [selectEra, setSelectEra] = useState<number>((currentEra.data?.index || 1) - 1 || 0);
  const [pageInfo, setPageInfo] = useState({
    pageSize: 30,
    currentPage: 1,
  });
  const [calcInput, setCalcInput] = useState<number>(0);
  const [rowSelected, setRowSelected] = useState<{ deploymentId: string }>();
  const allDeployments = useQuery<{
    eraDeploymentRewards: {
      nodes: { deploymentId: string; totalRewards: string }[];
      totalCount: number;
    };
  }>(
    gql`
      query allDeployments($currentIdx: Int!, $first: Int! = 30, $offset: Int! = 0) {
        eraDeploymentRewards(
          orderBy: TOTAL_REWARDS_DESC
          filter: { eraIdx: { equalTo: $currentIdx } }
          first: $first
          offset: $offset
        ) {
          nodes {
            deploymentId
            totalRewards
          }
          totalCount
        }
      }
    `,
    {
      variables: {
        currentIdx: selectEra,
        first: pageInfo.pageSize,
        offset: (pageInfo.currentPage - 1) * pageInfo.pageSize,
      },
    },
  );

  const allDeploymentsInfomations = useQuery<{
    deployments: {
      nodes: {
        id: string;
        metadata: string;
        project: {
          metadata: string;
        };
        indexers: {
          totalCount: number;
        };
      }[];
    };
    indexerAllocationSummaries: {
      groupedAggregates: { keys: string[]; sum: { totalAmount: string } }[];
    };
    deploymentBoosterSummaries: {
      groupedAggregates: { keys: string[]; sum: { totalAmount: string } }[];
    };
    eraDeploymentRewards: {
      groupedAggregates: { keys: string[]; sum: { allocationRewards: string; totalRewards: string } }[];
    };
  }>(
    gql`
      query allDeploymentsInfomations($deploymentIds: [String!], $currentIdx: Int!) {
        deployments(filter: { id: { in: $deploymentIds } }) {
          nodes {
            id
            metadata
            project {
              metadata
            }
            indexers(filter: { indexer: { active: { equalTo: true } }, status: { notEqualTo: TERMINATED } }) {
              totalCount
            }
          }
        }

        indexerAllocationSummaries(filter: { deploymentId: { in: $deploymentIds } }) {
          groupedAggregates(groupBy: DEPLOYMENT_ID) {
            keys
            sum {
              totalAmount
            }
          }
        }

        deploymentBoosterSummaries(filter: { deploymentId: { in: $deploymentIds } }) {
          groupedAggregates(groupBy: DEPLOYMENT_ID) {
            keys
            sum {
              totalAmount
            }
          }
        }

        eraDeploymentRewards(filter: { deploymentId: { in: $deploymentIds }, eraIdx: { equalTo: $currentIdx } }) {
          groupedAggregates(groupBy: DEPLOYMENT_ID) {
            keys
            sum {
              allocationRewards
              totalRewards
            }
          }
        }
      }
    `,
    {
      variables: {
        deploymentIds: allDeployments.data?.eraDeploymentRewards.nodes.map((node: any) => node.deploymentId) || [],
        currentIdx: selectEra,
      },
    },
  );

  const renderData = useMemo(() => {
    return allDeployments.data?.eraDeploymentRewards.nodes.map((node, index) => {
      const eraDeploymentRewardsItem = allDeploymentsInfomations.data?.eraDeploymentRewards.groupedAggregates.find(
        (i) => i.keys[0] === node.deploymentId,
      );
      const allocationRewards = eraDeploymentRewardsItem?.sum.allocationRewards || '0';
      const totalCount = allDeploymentsInfomations.data?.deployments.nodes.find((i) => i.id === node.deploymentId)
        ?.indexers.totalCount;

      const totalAllocation =
        allDeploymentsInfomations.data?.indexerAllocationSummaries.groupedAggregates.find(
          (i) => i.keys[0] === node.deploymentId,
        )?.sum.totalAmount || '0';
      const totalQueryRewards = BigNumberJs(eraDeploymentRewardsItem?.sum.totalRewards || '0')
        .minus(allocationRewards)
        .toFixed();
      const deploymentInfo = allDeploymentsInfomations.data?.deployments.nodes.find((i) => i.id === node.deploymentId);
      const allocationApy = BigNumberJs(allocationRewards || 0)
        .div(totalAllocation === '0' ? 1 : totalAllocation)
        .multipliedBy(52)
        .multipliedBy(100);
      return {
        deploymentId: node.deploymentId,
        projectMetadata: deploymentInfo?.project.metadata,
        operatorCount: totalCount,
        rawAllocationAmount: totalAllocation,
        rawAllocationRewards: allocationRewards,
        allocationAmount: formatNumber(formatSQT(totalAllocation)),
        boosterAmount: formatNumber(
          formatSQT(
            allDeploymentsInfomations.data?.deploymentBoosterSummaries.groupedAggregates.find(
              (i) => i.keys[0] === node.deploymentId,
            )?.sum.totalAmount || '0',
          ),
        ),
        allocationRewards: formatNumber(formatSQT(allocationRewards)),
        averageAllocationRewards: formatNumber(
          formatSQT(
            BigNumberJs(allocationRewards)
              .div(totalCount || 1)
              .toFixed(),
          ),
        ),
        allocationApy: allocationApy.gt(1000) ? '1000+' : allocationApy.toFixed(2),
        queryRewards: formatNumber(formatSQT(totalQueryRewards)),
        averageQueryRewards: formatNumber(
          formatSQT(
            BigNumberJs(totalQueryRewards)
              .div(totalCount || 1)
              .toFixed(),
          ),
        ),
        totalRewards: formatNumber(formatSQT(eraDeploymentRewardsItem?.sum.totalRewards || '0')),
        averageRewards: formatNumber(
          formatSQT(
            BigNumberJs(eraDeploymentRewardsItem?.sum.totalRewards || '0')
              .div(totalCount || 1)
              .toFixed(),
          ),
        ),
      };
    });
  }, [allDeployments.data, allDeploymentsInfomations.data]);

  const previousRenderData = usePrevious(renderData);

  const estimatedStakeRewards = useMemo(() => {
    const selectedRow = renderData?.find((i) => i.deploymentId === rowSelected?.deploymentId);
    if (!selectedRow) {
      return 0;
    }

    const { rawAllocationAmount, rawAllocationRewards } = selectedRow;
    const oneTokenRewards = BigNumberJs(rawAllocationRewards).div(rawAllocationAmount);
    return oneTokenRewards.multipliedBy(calcInput).toFixed(6);
  }, [rowSelected, calcInput]);

  useEffect(() => {
    if (currentEra.data?.index) {
      setSelectEra(currentEra.data?.index - 1);
    }
  }, [currentEra.data?.index]);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardInner}>
        <div className="flex" style={{ marginBottom: 24 }}>
          <Typography variant="large" weight={600}>
            Project Deployment Rewards
          </Typography>
        </div>

        <div className="flex" style={{ marginBottom: 24, gap: 24 }}>
          <Select
            className="darkSelector"
            style={{ width: 200 }}
            value={selectEra}
            options={new Array((currentEra.data?.index || 0) + 1 || 0).fill(0).map((_, index) => ({
              label: `Era ${index}`,
              value: index,
            }))}
            onChange={(value) => {
              setSelectEra(value);
            }}
            loading={currentEra.loading}
          ></Select>
          <Input
            className="darkInput"
            style={{ width: 342 }}
            placeholder="Search by deployment id"
            prefix={<IoSearch />}
          ></Input>
        </div>
        <div
          style={{
            padding: 24,
            display: 'flex',
            gap: 16,
            width: 700,
            border: '1px solid var(--dark-mode-border)',
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <div className="col-flex" style={{ justifyContent: 'space-between' }}>
            <Typography>Projected Rewards Calculator</Typography>
            <Typography>
              Estimated Rewards One Era: <br></br>
              {estimatedStakeRewards} {TOKEN}
            </Typography>
          </div>

          <div className="col-flex" style={{ gap: 8 }}>
            <Typography>Enter Your Stake</Typography>
            <Input
              className="darkInput"
              style={{ width: 342 }}
              placeholder="Enter your stake"
              type="number"
              suffix={<Typography>{TOKEN}</Typography>}
              value={calcInput}
              onChange={(e) => {
                setCalcInput(Number(e.target.value));
              }}
            ></Input>
          </div>
        </div>

        <Table
          rowKey={(record) => record.deploymentId}
          className={'darkTable'}
          loading={allDeploymentsInfomations.loading}
          columns={[
            {
              title: 'Project',
              dataIndex: 'name',
              key: 'name',
              render: (_, record) => {
                return <DeploymentMeta deploymentId={record.deploymentId} projectMetadata={record.projectMetadata} />;
              },
            },
            {
              title: 'Node Operators',
              dataIndex: 'operatorCount',
              key: 'operatorCount',
            },
            {
              title: 'Stake',
              dataIndex: 'allocationAmount',
              key: 'allocationAmount',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Boost',
              dataIndex: 'boosterAmount',
              key: 'boosterAmount',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Total Stake Rewards',
              dataIndex: 'allocationRewards',
              key: 'allocationRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Average Stake Rewards',
              dataIndex: 'averageAllocationRewards',
              key: 'averageAllocationRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Stake Apy',
              dataIndex: 'allocationApy',
              key: 'allocationApy',
              render: (text: string) => <Typography>{text} %</Typography>,
            },
            {
              title: 'Total Query Rewards',
              dataIndex: 'queryRewards',
              key: 'queryRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Average Query Rewards',
              dataIndex: 'averageQueryRewards',
              key: 'averageQueryRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Total Rewards',
              dataIndex: 'totalRewards',
              key: 'totalRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Average Rewards',
              dataIndex: 'averageRewards',
              key: 'averageRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
          ]}
          dataSource={renderData?.length ? renderData : previousRenderData}
          pagination={{
            total:
              allDeployments.data?.eraDeploymentRewards.totalCount ||
              allDeployments.previousData?.eraDeploymentRewards.totalCount,
            pageSize: pageInfo.pageSize,
            pageSizeOptions: ['10', '30', '50', '100'],
            current: pageInfo.currentPage,
            onChange(page, pageSize) {
              setPageInfo({
                pageSize,
                currentPage: page,
              });
            },
          }}
          rowSelection={{
            type: 'radio',
            hideSelectAll: true,
            selectedRowKeys: rowSelected ? [rowSelected.deploymentId] : [],
            onChange: (_, row) => {
              setRowSelected({
                deploymentId: row[0].deploymentId,
              });
            },
          }}
          onRow={(record) => {
            return {
              onClick: () => {
                setRowSelected({
                  deploymentId: record.deploymentId,
                });
              },
            };
          }}
        ></Table>
      </div>
    </div>
  );
};
export default ScannerDashboard;
