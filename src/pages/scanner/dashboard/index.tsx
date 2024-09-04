import React, { FC, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useProjectMetadata } from '@containers';
import { useEra } from '@hooks';
import { Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import { TOKEN } from '@utils';
import { Button, Table } from 'antd';
import BigNumberJs from 'bignumber.js';

import { formatNumber, formatSQT } from '../../../utils/numberFormatters';
import { OperatorRewardsLineChart } from './components/operatorRewardsChart/OperatorRewardsLineChart';
import styles from './index.module.less';

interface IProps {}

const ScannerDashboard: FC<IProps> = (props) => {
  const { currentEra } = useEra();
  const { getMetadataFromCid, getVersionMetadata } = useProjectMetadata();
  const top5Deployments = useQuery<{
    eraDeploymentRewards: {
      nodes: { deploymentId: string; totalRewards: string }[];
    };
  }>(
    gql`
      query top5Deployments($currentIdx: Int!) {
        eraDeploymentRewards(orderBy: TOTAL_REWARDS_DESC, filter: { eraIdx: { equalTo: $currentIdx } }, first: 5) {
          nodes {
            deploymentId
            totalRewards
          }
        }
      }
    `,
    {
      variables: {
        currentIdx: (currentEra.data?.index || 0) - 1,
      },
    },
  );

  const top5DeploymentsInfomations = useQuery<{
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
      query top5DeploymentsInfomations($deploymentIds: [String!], $currentIdx: Int!) {
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
        deploymentIds: top5Deployments.data?.eraDeploymentRewards.nodes.map((node: any) => node.deploymentId) || [],
        currentIdx: (currentEra.data?.index || 0) - 1,
      },
    },
  );

  const metadatas = useAsyncMemo<{ [key in string]: { name: string } }>(async () => {
    if (!top5DeploymentsInfomations.data?.deployments.nodes) return {};
    const projectMetadataCids = top5DeploymentsInfomations.data?.deployments.nodes.map((node) => node.project.metadata);
    const deploymentMetadataCids = top5DeploymentsInfomations.data?.deployments.nodes.map((node) => node.metadata);
    if (projectMetadataCids === undefined || deploymentMetadataCids === undefined) return {};
    const projectMetadata = await Promise.all(projectMetadataCids?.map((cid) => getMetadataFromCid(cid)));
    const deploymentMetadata = await Promise.all(deploymentMetadataCids?.map((cid) => getVersionMetadata(cid)));

    return top5DeploymentsInfomations.data?.deployments.nodes.reduce(
      (add, cur, index) => {
        const projectInfo = projectMetadata[index];
        const deploymentInfo = deploymentMetadata[index];

        add[cur.id] = {
          name: `${projectInfo.name} - ${deploymentInfo.version}`,
        };
        return add;
      },
      {} as { [key in string]: { name: string } },
    );
  }, [top5DeploymentsInfomations.data]);

  const renderData = useMemo(() => {
    return top5Deployments.data?.eraDeploymentRewards.nodes.map((node, index) => {
      const eraDeploymentRewardsItem = top5DeploymentsInfomations.data?.eraDeploymentRewards.groupedAggregates.find(
        (i) => i.keys[0] === node.deploymentId,
      );
      const allocationRewards = eraDeploymentRewardsItem?.sum.allocationRewards || '0';
      const totalCount = top5DeploymentsInfomations.data?.deployments.nodes.find((i) => i.id === node.deploymentId)
        ?.indexers.totalCount;

      const totalAllocation =
        top5DeploymentsInfomations.data?.indexerAllocationSummaries.groupedAggregates.find(
          (i) => i.keys[0] === node.deploymentId,
        )?.sum.totalAmount || '0';
      const totalQueryRewards = BigNumberJs(eraDeploymentRewardsItem?.sum.totalRewards || '0')
        .minus(allocationRewards)
        .toFixed();
      return {
        name: metadatas.data?.[node.deploymentId]?.name || node.deploymentId,
        operatorCount: totalCount,
        allocationAmount: formatNumber(formatSQT(totalAllocation)),
        boosterAmount: formatNumber(
          formatSQT(
            top5DeploymentsInfomations.data?.deploymentBoosterSummaries.groupedAggregates.find(
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
        allocationApy: BigNumberJs(allocationRewards)
          .div(totalAllocation)
          .multipliedBy(52)
          .multipliedBy(100)
          .toFixed(2),
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
  }, [metadatas.data, top5Deployments.data, top5DeploymentsInfomations.data]);

  return (
    <div className={styles.dashboard}>
      <Typography variant="h5" weight={600}>
        Dashboard
      </Typography>
      <OperatorRewardsLineChart></OperatorRewardsLineChart>
      <div className={styles.dashboardInner}>
        <div className="flex" style={{ marginBottom: 24 }}>
          <Typography variant="large" weight={600}>
            Top 5 Project Rewards
          </Typography>
          <span style={{ flex: 1 }}></span>
          <Button type="primary" shape="round">
            <a href="https://app.subquery.network/explorer/home" target="_blank" rel="noreferrer">
              View All Projects
            </a>
          </Button>
        </div>

        <Table
          className={'darkTable'}
          loading={top5Deployments.loading || top5DeploymentsInfomations.loading || metadatas.loading}
          columns={[
            {
              title: 'Project',
              dataIndex: 'name',
              key: 'name',
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
          dataSource={renderData}
          pagination={false}
        ></Table>
      </div>
    </div>
  );
};
export default ScannerDashboard;
