import React, { FC, useEffect, useMemo, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { useNavigate } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { DeploymentMeta } from '@components';
import { IndexerName } from '@components/IndexerDetails/IndexerName';
import { useAsyncMemo, useEra } from '@hooks';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { CurrentEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { usePrevious } from 'ahooks';
import { Button, Input, Select, Table } from 'antd';
import BigNumberJs from 'bignumber.js';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';

import { formatNumber, formatSQT } from '../../../utils/numberFormatters';
import styles from './index.module.less';

interface IProps {}

const ScannerDashboard: FC<IProps> = (props) => {
  const { currentEra } = useEra();
  const navigate = useNavigate();
  const { getUserQueriesAggregation } = useConsumerHostServices({
    autoLogin: false,
  });
  const [selectEra, setSelectEra] = useState<number>((currentEra.data?.index || 1) - 1 || 0);
  const [searchDeployment, setSearchDeployment] = useState<string>('');
  const debounceSearch = useMemo(() => debounce(setSearchDeployment, 500), [setSearchDeployment]);
  const [pageInfo, setPageInfo] = useState({
    pageSize: 30,
    currentPage: 1,
  });

  const blockHeightOfQuery = useMemo(() => {
    if (!currentEra.data?.index) return '99999999999999999';

    if (selectEra === currentEra.data.index - 1 || selectEra === currentEra.data.index) {
      return '99999999999999999';
    }

    return currentEra.data.eras?.find((i) => parseInt(i.id, 16) === selectEra)?.createdBlock || '99999999999999999';
  }, [selectEra, currentEra.data?.index]);

  const allIndexers = useQuery<{
    indexers: {
      nodes: { selfStake: CurrentEraValue; totalStake: CurrentEraValue; id: string }[];
      totalCount: number;
    };
  }>(
    gql`
      query getAllIndexers($first: Int! = 30, $offset: Int! = 0, $indexerId: String = "", $blockHeight: String!) {
        indexers(
          blockHeight: $blockHeight
          first: $first
          offset: $offset
          filter: { id: { includesInsensitive: $indexerId }, active: { equalTo: true } }
        ) {
          nodes {
            selfStake
            totalStake
            id
          }
          totalCount
        }
      }
    `,
    {
      variables: {
        first: pageInfo.pageSize,
        offset: (pageInfo.currentPage - 1) * pageInfo.pageSize,
        indexerId: searchDeployment,
        blockHeight: blockHeightOfQuery.toString(),
      },
    },
  );

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

        indexerEraDeploymentRewards(filter: { eraIdx: { equalTo: $era }, indexerId: { in: $indexers } }) {
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
        era: selectEra,
        indexers: allIndexers.data?.indexers.nodes.map((node) => node.id) || [],
      },
    },
  );

  const queriesOfAllIndexers = useAsyncMemo(async () => {
    if (!allIndexers.data?.indexers.nodes.length || !currentEra.data?.index) {
      return [];
    }

    const selectEraInfo = currentEra.data?.eras?.find((i) => parseInt(i.id, 16) === selectEra);

    const startDate = dayjs(selectEraInfo?.startTime || '0').format('YYYY-MM-DD');

    const endDate = selectEraInfo?.endTime ? dayjs(selectEraInfo?.endTime || '0').format('YYYY-MM-DD') : undefined;

    const queries = await getUserQueriesAggregation({
      user_list: allIndexers.data?.indexers.nodes.map((node) => node.id.toLowerCase()) || [],
      start_date: startDate,
      end_date: endDate,
    });

    return queries.data;
  }, [currentEra.data?.index, allIndexers.data, selectEra]);

  const renderData = useMemo(() => {
    if (!allIndexers.data?.indexers.nodes.length || !indexerRewardsInfos.data) {
      return [];
    }

    const indexerRewardsMap = indexerRewardsInfos.data?.indexerEraDeploymentRewards.groupedAggregates.reduce(
      (acc, cur) => {
        acc[cur.keys[0]] = cur.sum;
        return acc;
      },
      {} as Record<string, { allocationRewards: string; queryRewards: string; totalRewards: string }>,
    );

    return allIndexers.data.indexers.nodes.map((indexer) => {
      const indexerRewards = indexerRewardsMap[indexer.id];
      const apy = indexerRewardsInfos.data?.eraIndexerApies.nodes.find(
        (node) => node.indexerId === indexer.id,
      )?.indexerApy;

      const totalStake = parseRawEraValue(indexer.totalStake, selectEra).current.toString();
      const selfStake = parseRawEraValue(indexer.selfStake, selectEra).current.toString();
      const queries = queriesOfAllIndexers.data?.find((i) => i.user.toLowerCase() === indexer.id.toLowerCase());

      return {
        ...indexer,
        totalStake: formatNumber(formatSQT(totalStake || '0')),
        selfStake: formatNumber(formatSQT(selfStake || '0')),
        delegationStake: formatNumber(formatSQT(BigNumberJs(totalStake).minus(selfStake).toString())),
        allocationRewards: formatNumber(formatSQT(BigNumberJs(indexerRewards?.allocationRewards || 0).toString())),
        queryRewards: formatNumber(formatSQT(BigNumberJs(indexerRewards?.queryRewards || 0).toString())),
        queries: BigNumberJs(queries?.info.total || 0)
          .div(10 ** 15)
          .toFixed(0),
        apy: BigNumberJs(formatSQT(apy || '0'))
          .multipliedBy(100)
          .toFixed(2),
      };
    });
  }, [allIndexers.data, indexerRewardsInfos.data, selectEra, queriesOfAllIndexers]);

  const previousRenderData = usePrevious(renderData);

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
            Node Operators ({allIndexers.data?.indexers.totalCount ?? allIndexers.previousData?.indexers.totalCount})
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
            placeholder="Search by address"
            prefix={<IoSearch />}
            onChange={(e) => {
              debounceSearch(e.target.value);
            }}
          ></Input>
        </div>

        <Table
          rowKey={(record) => record.id}
          className={'darkTable'}
          loading={allIndexers.loading || indexerRewardsInfos.loading}
          columns={[
            {
              title: 'Node Operators',
              dataIndex: 'name',
              key: 'name',
              render: (_, record) => {
                return (
                  <IndexerName
                    theme="dark"
                    address={record.id}
                    onClick={() => {
                      navigate(`/node-operator/${record.id}`);
                    }}
                  />
                );
              },
            },
            {
              title: 'apy',
              dataIndex: 'apy',
              key: 'apy',
              render: (text: string) => <Typography>{text} %</Typography>,
            },
            {
              title: 'Stake',
              dataIndex: 'totalStake',
              key: 'totalStake',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
            {
              title: 'Self Stake',
              dataIndex: 'selfStake',
              key: 'selfStake',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
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
              title: 'Queries',
              dataIndex: 'queries',
              key: 'queries',
              render: (text: string) => <Typography>{formatNumber(text, 0)}</Typography>,
            },
            {
              title: 'Delegation',
              dataIndex: 'delegationStake',
              key: 'delegationStake',
              render: (text: string) => (
                <Typography>
                  {text} {TOKEN}
                </Typography>
              ),
            },
          ]}
          dataSource={renderData?.length ? renderData : previousRenderData}
          pagination={{
            total: allIndexers.data?.indexers.totalCount || allIndexers.previousData?.indexers.totalCount,
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
    </div>
  );
};
export default ScannerDashboard;
