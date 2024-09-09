import React, { FC, useEffect, useMemo, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { DeploymentMeta } from '@components';
import { useEra } from '@hooks';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { usePrevious } from 'ahooks';
import { Button, Input, Radio, Select, Table } from 'antd';
import BigNumberJs from 'bignumber.js';
import { parseEther } from 'ethers/lib/utils';
import { debounce } from 'lodash-es';

import { formatNumber, formatSQT } from '../../../utils/numberFormatters';
import styles from './index.module.less';

interface IProps {}

const ScannerDashboard: FC<IProps> = (props) => {
  const { currentEra } = useEra();
  const navigate = useNavigate();
  const [selectEra, setSelectEra] = useState<number>((currentEra.data?.index || 1) - 1 || 0);
  const [pageInfo, setPageInfo] = useState({
    pageSize: 30,
    currentPage: 1,
  });
  const [calcInput, setCalcInput] = useState<number>(100000);
  const [rowSelected, setRowSelected] = useState<{ deploymentId: string }>();
  const [statisticGroup, setStatisticGroup] = useState<'averageRewards' | 'projectedRewards'>('averageRewards');
  const [searchDeployment, setSearchDeployment] = useState<string>('');
  const debounceSearch = useMemo(() => debounce(setSearchDeployment, 500), [setSearchDeployment]);
  const blockHeightOfQuery = useMemo(() => {
    if (!currentEra.data?.index) return '99999999999999999';

    if (selectEra === currentEra.data.index - 1 || selectEra === currentEra.data.index) {
      return '99999999999999999';
    }

    return currentEra.data.eras?.find((i) => parseInt(i.id, 16) === selectEra)?.createdBlock || '99999999999999999';
  }, [selectEra, currentEra.data?.index]);

  const allDeployments = useQuery<{
    eraDeploymentRewards: {
      nodes: { deploymentId: string; totalRewards: string }[];
      totalCount: number;
    };
  }>(
    gql`
      query allDeployments($deploymentId: String = "", $currentIdx: Int!, $first: Int! = 30, $offset: Int! = 0) {
        eraDeploymentRewards(
          orderBy: TOTAL_REWARDS_DESC
          filter: { eraIdx: { equalTo: $currentIdx }, deploymentId: { includesInsensitive: $deploymentId } }
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
        deploymentId: searchDeployment,
      },
    },
  );

  const allDeploymentsInfomations = useQuery<{
    deployments: {
      nodes: {
        id: string;
        metadata: string;
        project: {
          id: string;
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
      query allDeploymentsInfomations($blockHeight: String!, $deploymentIds: [String!], $currentIdx: Int!) {
        deployments(blockHeight: $blockHeight, filter: { id: { in: $deploymentIds } }) {
          nodes {
            id
            metadata
            project {
              id
              metadata
            }
            indexers(filter: { indexer: { active: { equalTo: true } }, status: { notEqualTo: TERMINATED } }) {
              totalCount
            }
          }
        }

        indexerAllocationSummaries(blockHeight: $blockHeight, filter: { deploymentId: { in: $deploymentIds } }) {
          groupedAggregates(groupBy: DEPLOYMENT_ID) {
            keys
            sum {
              totalAmount
            }
          }
        }

        deploymentBoosterSummaries(blockHeight: $blockHeight, filter: { deploymentId: { in: $deploymentIds } }) {
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
        blockHeight: blockHeightOfQuery.toString(),
      },
    },
  );

  const renderData = useMemo(() => {
    if (!allDeployments.data?.eraDeploymentRewards.nodes) return [];
    return allDeployments.data?.eraDeploymentRewards.nodes.map((node) => {
      const inputStake = BigNumberJs(calcInput).gt(100000000) ? '100000000' : calcInput;
      const eraDeploymentRewardsItem = allDeploymentsInfomations.data?.eraDeploymentRewards.groupedAggregates.find(
        (i) => i.keys[0] === node.deploymentId,
      );

      const rawTotalStake = BigNumberJs(
        allDeploymentsInfomations.data?.indexerAllocationSummaries.groupedAggregates.find(
          (i) => i.keys[0] === node.deploymentId,
        )?.sum.totalAmount || '0',
      );

      const rawTotalRewards = BigNumberJs(eraDeploymentRewardsItem?.sum.allocationRewards || '0');

      const estimatedRewardsOfInputStake = rawTotalRewards.multipliedBy(
        BigNumberJs(parseEther(inputStake.toString()).toString()).div(
          rawTotalStake.plus(parseEther(inputStake.toString()).toString()),
        ),
      );

      const totalCount =
        (allDeploymentsInfomations.data?.deployments.nodes.find((i) => i.id === node.deploymentId)?.indexers
          .totalCount || 0) + (statisticGroup === 'averageRewards' ? 0 : 1);

      const totalAllocation = rawTotalStake
        .plus(statisticGroup === 'averageRewards' ? 0 : parseEther(inputStake.toString()).toString())
        .toString();

      const allocationRewards =
        statisticGroup === 'projectedRewards'
          ? estimatedRewardsOfInputStake.toString()
          : eraDeploymentRewardsItem?.sum.allocationRewards || '0';

      const totalQueryRewards = BigNumberJs(eraDeploymentRewardsItem?.sum.totalRewards || '0')
        .minus(eraDeploymentRewardsItem?.sum.allocationRewards || '0')
        .toFixed();
      const deploymentInfo = allDeploymentsInfomations.data?.deployments.nodes.find((i) => i.id === node.deploymentId);
      const allocationApy = BigNumberJs(allocationRewards || 0)
        .div(statisticGroup === 'averageRewards' ? totalAllocation : parseEther(inputStake.toString()).toString())
        .multipliedBy(52)
        .multipliedBy(100);

      return {
        deploymentId: node.deploymentId,
        projectMetadata: deploymentInfo?.project.metadata,
        projectId: deploymentInfo?.project.id,
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
        allocationApy: allocationApy.isNaN() ? '0.00' : allocationApy.gt(1000) ? '1000+' : allocationApy.toFixed(2),
        queryRewards: formatNumber(formatSQT(totalQueryRewards)),
        averageQueryRewards: formatNumber(
          formatSQT(
            BigNumberJs(totalQueryRewards)
              .div(totalCount || 1)
              .toFixed(),
          ),
        ),
        totalRewards: formatNumber(formatSQT(BigNumberJs(allocationRewards).plus(totalQueryRewards).toString())),
        averageRewards: formatNumber(
          formatSQT(
            BigNumberJs(eraDeploymentRewardsItem?.sum.totalRewards || '0')
              .div(totalCount || 1)
              .toFixed(),
          ),
        ),
      };
    });
  }, [allDeployments.data, allDeploymentsInfomations.data, calcInput, statisticGroup]);

  const previousRenderData = usePrevious(renderData);

  const estimatedStakeRewards = useMemo(() => {
    const selectedRow = renderData?.find((i) => i.deploymentId === rowSelected?.deploymentId);
    if (!selectedRow) {
      return 0;
    }

    const { rawAllocationAmount, rawAllocationRewards } = selectedRow;
    if (BigNumberJs(rawAllocationAmount).isZero()) {
      return 0;
    }
    const oneTokenRewards = BigNumberJs(rawAllocationRewards).div(
      rawAllocationAmount === '0' ? 1 : rawAllocationAmount,
    );
    const result = oneTokenRewards.multipliedBy(calcInput).toFixed(6);
    if (isNaN(+result)) {
      return '0.000000';
    }
    return result;
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
          <Radio.Group
            className="darkRadioGroup"
            options={[
              { label: 'Previous Average Rewards', value: 'averageRewards' },
              { label: 'Projected Rewards', value: 'projectedRewards' },
            ]}
            onChange={(val) => {
              setStatisticGroup(val.target.value);
            }}
            value={statisticGroup}
            optionType="button"
            buttonStyle="solid"
          />
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
            onChange={(e) => {
              debounceSearch(e.target.value);
            }}
          ></Input>
        </div>
        {statisticGroup === 'projectedRewards' ? (
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
              <Typography style={{ visibility: 'hidden' }}>
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
                  if (Number(e.target.value) > 100000000) {
                    setCalcInput(100000000);
                    return;
                  }

                  setCalcInput(Number(e.target.value));
                }}
                onBlur={(e) => {
                  if (Number(e.target.value) < 1) {
                    setCalcInput(1);
                    return;
                  }
                }}
                min="1"
                max={100000000}
              ></Input>
            </div>
          </div>
        ) : (
          ''
        )}

        <Table
          rowKey={(record) => record.deploymentId}
          className={'darkTable'}
          loading={allDeploymentsInfomations.loading}
          columns={[
            {
              title: 'Project',
              dataIndex: 'name',
              key: 'name',
              render: (_: string, record: (typeof renderData)[number]) => {
                return <DeploymentMeta deploymentId={record.deploymentId} projectMetadata={record.projectMetadata} />;
              },
              onCell: (record: (typeof renderData)[number]) => {
                return {
                  onClick: () => {
                    navigate(
                      `/project-deployment-rewards/${record.deploymentId}?projectMetadata=${record.projectMetadata}&projectId=${record.projectId}`,
                    );
                  },
                };
              },
            },
            {
              title: 'Node Operators',
              dataIndex: 'operatorCount',
              key: 'operatorCount',
              render: (text: number) => <Typography>{text}</Typography>,
            },
            {
              title: statisticGroup === 'averageRewards' ? 'Stake' : 'Projected Total Stake',
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
              title: 'Projected Stake Rewards',
              dataIndex: 'allocationRewards',
              key: 'allocationRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.rawAllocationRewards).comparedTo(b.rawAllocationRewards);
              },
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
              title: statisticGroup === 'averageRewards' ? 'Stake Apy' : 'Projected Stake APY',
              dataIndex: 'allocationApy',
              key: 'allocationApy',
              render: (text: string) => <Typography>{text} %</Typography>,
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.allocationApy).comparedTo(b.allocationApy);
              },
            },
            {
              title: 'Projected Query Rewards',
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
              title: 'Projected Rewards',
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
          ].filter((i) => {
            const keysOfAver = [
              'name',
              'operatorCount',
              'allocationAmount',
              'boosterAmount',
              'averageAllocationRewards',
              'allocationApy',
              'averageQueryRewards',
            ];
            const keysOfProj = [
              'name',
              'operatorCount',
              'allocationAmount',
              'boosterAmount',
              'allocationRewards',
              'allocationApy',
              'queryRewards',
              'totalRewards',
            ];

            if (statisticGroup === 'averageRewards') {
              return keysOfAver.includes(i.dataIndex);
            } else {
              return keysOfProj.includes(i.dataIndex);
            }
          })}
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
