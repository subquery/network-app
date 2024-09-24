import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { DeploymentMeta } from '@components';
import { IndexerName } from '@components/IndexerDetails/IndexerName';
import { useProjectMetadata } from '@containers';
import { useAsyncMemo, useEra } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { usePrevious } from 'ahooks';
import { Breadcrumb, Button, Table } from 'antd';
import BigNumberJs from 'bignumber.js';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { formatNumber, formatSQT } from '../../../utils/numberFormatters';
import { PriceQueriesChart } from './components/priceQueries/priceQueries';
import { RewardsByType } from './components/rewardsByType/rewardsByType';
import styles from './index.module.less';

interface IProps {}

const ProjectDetail: FC<IProps> = (props) => {
  const { currentEra } = useEra();
  const navigate = useNavigate();
  const { id: deploymentId } = useParams();
  const [query] = useSearchParams();
  const { getProjects, getStatisticQueriesByPrice, getStatisticQueries } = useConsumerHostServices({
    autoLogin: false,
  });
  const { getMetadataFromCid } = useProjectMetadata();

  const metadata = useAsyncMemo(async () => {
    if (!query.get('projectMetadata')) return null;
    return await getMetadataFromCid(query.get('projectMetadata') || '');
  }, [query]);

  const [selectEra, setSelectEra] = useState<number>((currentEra.data?.index || 1) - 1 || 0);
  const [pageInfo, setPageInfo] = useState({
    pageSize: 100,
    currentPage: 1,
  });
  const deploymentInfomations = useQuery<{
    eraDeploymentRewards: {
      aggregates: {
        sum: {
          allocationRewards: string;
          totalRewards: string;
        };
      };
    };
    deployment: {
      indexers: {
        totalCount: number;
        nodes: {
          indexerId: string;
        }[];
      };
      projectId: string;
    };
  }>(
    gql`
      query deploymentInfomations($deploymentId: String!, $first: Int! = 30, $offset: Int! = 0) {
        eraDeploymentRewards(filter: { deploymentId: { equalTo: $deploymentId } }) {
          aggregates {
            sum {
              allocationRewards
              totalRewards
            }
          }
        }

        deployment(id: $deploymentId) {
          indexers(
            first: $first
            offset: $offset
            filter: { indexer: { active: { equalTo: true } }, status: { notEqualTo: TERMINATED } }
          ) {
            totalCount
            nodes {
              indexerId
            }
          }
          projectId
        }
      }
    `,
    {
      variables: {
        deploymentId,
        first: pageInfo.pageSize,
        offset: (pageInfo.currentPage - 1) * pageInfo.pageSize,
      },
    },
  );

  const deploymentIndexerRewardsInfos = useQuery<{
    indexerAllocationRewards: {
      groupedAggregates: {
        sum: {
          burnt: string;
        };
        keys: string[];
      }[];
    };
    indexerAllocationSummaries: {
      nodes: {
        indexerId: string;
        totalAmount: string;
      }[];
    };
    eraIndexerDeploymentApies: {
      nodes: {
        apy: string;
        indexerId: string;
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
      query getDeoloymentIndexerRewardsInfos($indexerIds: [String!], $deploymentId: String!, $eraIdx: Int!) {
        indexerAllocationRewards(filter: { indexerId: { in: $indexerIds }, deploymentId: { equalTo: $deploymentId } }) {
          groupedAggregates(groupBy: INDEXER_ID) {
            sum {
              burnt
            }
            keys
          }
        }

        indexerAllocationSummaries(
          filter: { indexerId: { in: $indexerIds }, deploymentId: { equalTo: $deploymentId } }
        ) {
          nodes {
            indexerId
            totalAmount
          }
        }

        eraIndexerDeploymentApies(
          filter: {
            indexerId: { in: $indexerIds }
            eraIdx: { equalTo: $eraIdx }
            deploymentId: { equalTo: $deploymentId }
          }
        ) {
          nodes {
            apy
            indexerId
          }
        }

        indexerEraDeploymentRewards(
          filter: { indexerId: { in: $indexerIds }, deploymentId: { equalTo: $deploymentId } }
        ) {
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
        indexerIds: deploymentInfomations.data?.deployment.indexers.nodes.map((i) => i.indexerId) || [],
        deploymentId,
        eraIdx: selectEra,
      },
    },
  );

  const priceOfIndexers = useAsyncMemo(async () => {
    const res = await getProjects({
      projectId: `${parseInt(deploymentInfomations.data?.deployment.projectId || '0x00', 16)}`,
      deployment: deploymentId,
    });

    return res.data.indexers;
  }, [deploymentId, deploymentInfomations.data?.deployment.projectId]);

  const queries = useAsyncMemo(async () => {
    if (!currentEra.data || !deploymentId) return [];
    const deployments = [deploymentId];

    const selectedEra = currentEra.data?.eras?.find((i) => parseInt(i.id, 16) === selectEra);

    try {
      const res = await getStatisticQueries({
        deployment: deployments,
        start_date: dayjs(selectedEra?.startTime).format('YYYY-MM-DD'),
        end_date: selectedEra?.endTime ? dayjs(selectedEra?.endTime).format('YYYY-MM-DD') : undefined,
      });

      return res.data.list;
    } catch (e) {
      return [];
    }
  }, [deploymentId, currentEra.data?.startTime, selectEra]);

  const renderData = useMemo(() => {
    if (!deploymentInfomations.data?.deployment?.indexers?.nodes.length) {
      return [];
    }

    return deploymentInfomations.data?.deployment?.indexers?.nodes
      .map((node) => {
        return {
          indexerId: node.indexerId,
          totalRewards: formatNumber(
            formatSQT(
              deploymentIndexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.find(
                (i) => i.keys[0] === node.indexerId,
              )?.sum.totalRewards || '0',
            ),
          ),
          rawTotalRewards: formatSQT(
            deploymentIndexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.find(
              (i) => i.keys[0] === node.indexerId,
            )?.sum.totalRewards || '0',
          ),
          queryRewards: formatNumber(
            formatSQT(
              deploymentIndexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.find(
                (i) => i.keys[0] === node.indexerId,
              )?.sum.queryRewards || '0',
            ),
          ),
          rawQueryRewards: formatSQT(
            deploymentIndexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.find(
              (i) => i.keys[0] === node.indexerId,
            )?.sum.queryRewards || '0',
          ),
          allocationRewards: formatNumber(
            formatSQT(
              deploymentIndexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.find(
                (i) => i.keys[0] === node.indexerId,
              )?.sum.allocationRewards || '0',
            ),
          ),
          rawAllocationRewards: formatSQT(
            deploymentIndexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.find(
              (i) => i.keys[0] === node.indexerId,
            )?.sum.allocationRewards || '0',
          ),
          apy: BigNumberJs(
            formatSQT(
              deploymentIndexerRewardsInfos.data?.eraIndexerDeploymentApies.nodes.find(
                (i) => i.indexerId === node.indexerId,
              )?.apy || '0',
            ),
          )
            .multipliedBy(100)
            .toFixed(2),
          totalAmount: formatNumber(
            formatSQT(
              deploymentIndexerRewardsInfos.data?.indexerAllocationSummaries.nodes.find(
                (i) => i.indexerId === node.indexerId,
              )?.totalAmount || '0',
            ),
          ),
          rawTotalAmount: formatSQT(
            deploymentIndexerRewardsInfos.data?.indexerAllocationSummaries.nodes.find(
              (i) => i.indexerId === node.indexerId,
            )?.totalAmount || '0',
          ),
          burnt: formatNumber(
            formatSQT(
              deploymentIndexerRewardsInfos.data?.indexerAllocationRewards.groupedAggregates.find(
                (i) => i.keys[0] === node.indexerId,
              )?.sum.burnt || '0',
            ),
          ),
          rawBurnt: formatSQT(
            deploymentIndexerRewardsInfos.data?.indexerAllocationRewards.groupedAggregates.find(
              (i) => i.keys[0] === node.indexerId,
            )?.sum.burnt || '0',
          ),
          price: BigNumberJs(
            formatSQT(priceOfIndexers.data?.find((i) => i.indexer === node.indexerId.toLowerCase())?.price || '0'),
          )
            .multipliedBy(1000)
            .toFixed(2),
        };
      })
      .sort((a, b) => {
        return BigNumberJs(b.rawTotalRewards).comparedTo(a.rawTotalRewards);
      });
  }, [deploymentInfomations.data, deploymentIndexerRewardsInfos.data, priceOfIndexers.data]);

  const previousRenderData = usePrevious(renderData);

  useEffect(() => {
    if (currentEra.data?.index) {
      setSelectEra(currentEra.data?.index - 1);
    }
  }, [currentEra.data?.index]);

  return (
    <div className={styles.dashboard}>
      <Breadcrumb
        className="darkBreadcrumb"
        items={[
          {
            key: 'explorer',
            title: (
              <Typography variant="medium" type="secondary" style={{ cursor: 'pointer' }}>
                Project Deployment Rewards
              </Typography>
            ),
            onClick: () => {
              navigate(`/project-deployment-rewards`);
            },
          },
          {
            key: 'current',
            title: (
              <Typography variant="medium" className="overflowEllipsis" style={{ maxWidth: 300 }}>
                {metadata.data?.name}
              </Typography>
            ),
          },
        ]}
      ></Breadcrumb>

      <div className={clsx('flex', 'gap32')} style={{ height: '400px' }}>
        <div
          className={styles.dashboardInner}
          style={{ width: 'calc(50% - 32px)', flexShrink: 0, maxWidth: 'calc(50% - 32px)' }}
        >
          <div className="flex">
            <DeploymentMeta
              deploymentId={deploymentId || ''}
              projectMetadata={query.get('projectMetadata') || ''}
              maxWidth="100%"
            />
            <span style={{ flex: 1 }}></span>
            <Button type="primary" shape="round" size="large">
              <a
                href={`https://app.subquery.network/explorer/project/${query.get('projectId')}/overview?deploymentId=${deploymentId}`}
                target="_blank"
                rel="noreferrer"
              >
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
                  formatSQT(deploymentInfomations.data?.eraDeploymentRewards.aggregates.sum.totalRewards || '0'),
                )}{' '}
                {TOKEN}
              </Typography>
            </div>

            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Node Operators
              </Typography>

              <Typography>{deploymentInfomations.data?.deployment.indexers.totalCount}</Typography>
            </div>

            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Stake Rewards
              </Typography>

              <Typography>
                {formatNumber(
                  formatSQT(deploymentInfomations.data?.eraDeploymentRewards.aggregates.sum.allocationRewards || '0'),
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
                    BigNumberJs(deploymentInfomations.data?.eraDeploymentRewards.aggregates.sum.totalRewards || '0')
                      .minus(deploymentInfomations.data?.eraDeploymentRewards.aggregates.sum.allocationRewards || '0')
                      .toString(),
                  ),
                )}{' '}
                {TOKEN}
              </Typography>
            </div>

            <div className="flex gap32">
              <Typography type="secondary" style={{ width: 130 }}>
                Queries
              </Typography>

              <Typography>
                {formatNumber(queries.data?.find((i) => i.deployment === deploymentId)?.queries || 0)}
              </Typography>
            </div>
          </div>
        </div>

        <PriceQueriesChart chartsStyle={{ flex: 1, height: '100%' }} deploymentId={deploymentId}></PriceQueriesChart>
      </div>
      <div className={styles.dashboardInner}>
        <div className="flex" style={{ marginBottom: 24 }}>
          <Typography variant="large" weight={600}>
            Node Operators
            {deploymentInfomations.loading && !deploymentInfomations.previousData ? (
              ''
            ) : (
              <>
                (
                {deploymentInfomations.data?.deployment.indexers.totalCount ||
                  deploymentInfomations.previousData?.deployment.indexers.totalCount}
                )
              </>
            )}
          </Typography>
        </div>

        <Table
          rowKey={(record) => record.indexerId}
          className={'darkTable'}
          loading={deploymentInfomations.loading || deploymentIndexerRewardsInfos.loading}
          columns={[
            {
              title: 'Node Operators',
              dataIndex: 'indexerId',
              key: 'indexerId',
              render: (_: string, record: (typeof renderData)[number]) => {
                return <IndexerName theme="dark" address={record.indexerId} />;
              },
              onCell: (record: (typeof renderData)[number]) => {
                return {
                  onClick: () => {
                    navigate(`/node-operator/${record.indexerId}`);
                  },
                };
              },
            },
            {
              title: 'Stake',
              dataIndex: 'totalAmount',
              key: 'totalAmount',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.rawTotalAmount).comparedTo(b.rawTotalAmount);
              },
            },
            {
              title: 'Stake Rewards',
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
              title: 'Query rewards',
              dataIndex: 'queryRewards',
              key: 'queryRewards',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.rawQueryRewards).comparedTo(b.rawQueryRewards);
              },
            },
            {
              title: 'Stake Apy',
              dataIndex: 'apy',
              key: 'apy',
              render: (text: string) => <Typography>{text} %</Typography>,
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.apy).comparedTo(b.apy);
              },
            },
            {
              title: 'Price Per 1,000 Queries',
              dataIndex: 'price',
              key: 'price',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.price).comparedTo(b.price);
              },
            },
            {
              title: 'Burned Rewards',
              dataIndex: 'burnt',
              key: 'burnt',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.rawBurnt).comparedTo(b.rawBurnt);
              },
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
              sorter: (a: (typeof renderData)[number], b: (typeof renderData)[number]) => {
                return BigNumberJs(a.rawTotalRewards).comparedTo(b.rawTotalRewards);
              },
            },
          ]}
          dataSource={renderData?.length ? renderData : previousRenderData}
          pagination={{
            total:
              deploymentInfomations.data?.deployment.indexers.totalCount ||
              deploymentInfomations.previousData?.deployment.indexers.totalCount,
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
        ></Table>
      </div>

      <RewardsByType deploymentId={deploymentId}></RewardsByType>
    </div>
  );
};
export default ProjectDetail;
