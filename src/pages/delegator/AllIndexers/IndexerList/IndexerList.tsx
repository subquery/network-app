// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCollectionPlayFill } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import { APYTooltip, SearchInput } from '@components';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { useEra, useNetworkClient } from '@hooks';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { CurrentEraValue, Indexer } from '@subql/network-clients';
import { IndexerApySummariesOrderBy, IndexerApySummaryFilter } from '@subql/network-query';
import { useGetAllDelegationsQuery, useGetAllIndexerByApyLazyQuery } from '@subql/react-hooks';
import { formatEther, formatNumber, formatNumberWithLocale, getOrderedAccounts, notEmpty, TOKEN } from '@utils';
import { ROUTES } from '@utils';
import { useSize } from 'ahooks';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import BigNumberJs from 'bignumber.js';
import { BigNumber } from 'ethers';
import { FixedType } from 'rc-table/lib/interface';

import { DoDelegate } from '../../DoDelegate';
import styles from './IndexerList.module.css';

const { INDEXER } = ROUTES;

type IndexerWithApy = Indexer & { indexerApy: string; delegatorApy: string; apyEra: number };

export const IndexerList: React.FC = () => {
  const { t } = useTranslation();
  const networkClient = useNetworkClient();
  const { account } = useWeb3();
  const { currentEra } = useEra();

  const navigate = useNavigate();
  const { width } = useSize(document.querySelector('body')) || { width: 0 };
  const viewIndexerDetail = (id: string) => {
    navigate(`/${INDEXER}/${id}`);
  };
  const [requestIndexers, fetchedIndexers] = useGetAllIndexerByApyLazyQuery();
  const [pageStartIndex, setPageStartIndex] = React.useState(1);
  const [loadingList, setLoadingList] = React.useState<boolean>(false);
  const [indexerList, setIndexerList] = React.useState<IndexerWithApy[]>([]);
  const [closeBannerTips, setCloseBannerTips] = React.useState<boolean>(false);
  const { getDisplayedCommission } = useMinCommissionRate();

  const delegations = useGetAllDelegationsQuery();

  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();

  const onLoadMore = async (offset: number, filter?: IndexerApySummaryFilter) => {
    try {
      setLoadingList(true);
      setIndexerList([]);
      // TODO: if searched result may more than 1 page, need to add filter for pagination,
      //       but now at most 1 result.
      const res = await requestIndexers({
        variables: {
          offset,
          first: 10,
          orderBy: [IndexerApySummariesOrderBy.DELEGATOR_APY_DESC],
          filter: {
            ...filter,
            indexer: {
              ...filter?.indexer,
              active: {
                equalTo: true,
              },
            },
          },
        },
      });

      const rawIndexerList = res.data?.indexerApySummaries?.nodes || [];
      if (rawIndexerList.length > 0) {
        const sortedIndexers = await Promise.all(
          rawIndexerList.map((indexer) => {
            return networkClient?.getIndexer(
              indexer?.indexerId || '',
              BigNumber.from(currentEra.data?.index || 0) || undefined,
              indexer?.indexer || undefined,
            );
          }),
        );

        setIndexerList(
          sortedIndexers.filter(notEmpty).map((i) => {
            const findIndexerInfo = rawIndexerList.find((indexer) => indexer?.indexerId === i?.address);
            return {
              ...i,
              indexerApy: findIndexerInfo?.indexerApy.toString() || '0',
              delegatorApy: findIndexerInfo?.delegatorApy.toString() || '0',
              apyEra: findIndexerInfo?.eraIdx || 0,
            };
          }),
        );
        return sortedIndexers;
      }
    } finally {
      setLoadingList(false);
    }
  };

  const totalCounts = React.useMemo(() => {
    return fetchedIndexers.data?.indexerApySummaries?.totalCount;
  }, [searchIndexer, fetchedIndexers.data?.indexerApySummaries?.totalCount]);

  const orderedIndexerList = React.useMemo(() => {
    const fillMinCommissionIndexerList = indexerList.map((i) => {
      return {
        ...i,
        commission: {
          current: getDisplayedCommission(i.commission.current * 100),
          after: getDisplayedCommission(i.commission.after * 100),
        } as CurrentEraValue<number>,
      };
    });
    return fillMinCommissionIndexerList ? getOrderedAccounts(fillMinCommissionIndexerList, 'address', account) : [];
  }, [account, indexerList]);

  const columns = useMemo(() => {
    const getColumns = (): ColumnsType<IndexerWithApy> => [
      {
        title: <TableTitle title={t('indexer.nickname')} />,
        dataIndex: 'address',
        key: 'address',
        width: 100,
        render: (val: string) =>
          val ? <ConnectedIndexer id={val} account={account} onClick={viewIndexerDetail} /> : <></>,
      },
      {
        title: (
          <Typography
            weight={600}
            variant="small"
            type="secondary"
            className="flex-center"
            style={{ textTransform: 'uppercase' }}
          >
            Estimated APY
            <APYTooltip
              currentEra={undefined}
              calculationDescription={
                'This is an estimated APY rewarded to Delegators from this Node Operator based on the last Era.'
              }
            />
          </Typography>
        ),
        key: 'delegatorApy',
        dataIndex: 'delegatorApy',
        width: '150px',
        render: (value: string) => {
          return <Typography>{BigNumberJs(formatEther(value)).multipliedBy(100).toFixed(2)} %</Typography>;
        },
      },
      {
        title: <TableTitle title={t('indexer.delegated')} />,
        key: 'delegatedKey',
        dataIndex: 'delegated',
        width: 130,
        render: (value: { current: string; after: string }) => {
          return (
            <div className="col-flex">
              <Typography>
                <TokenAmount
                  tooltip={`${formatNumberWithLocale(formatEther(value.current, 4))} ${TOKEN}`}
                  value={formatNumber(formatEther(value.current, 4))}
                />
              </Typography>
              <EstimatedNextEraLayout
                valueTooltip={`${formatNumberWithLocale(formatEther(value.after, 4))} ${TOKEN}`}
                value={`${formatNumber(formatEther(value.after, 4))} ${TOKEN}`}
              ></EstimatedNextEraLayout>
            </div>
          );
        },
      },
      {
        title: <TableTitle title="Remaining capacity" />,
        key: 'capacityKey',
        dataIndex: 'capacity',
        width: 150,
        render: (value: { current: string; after: string }) => {
          return (
            <div className="col-flex">
              <Typography>
                <TokenAmount
                  tooltip={`${formatNumberWithLocale(
                    BigNumberJs(formatEther(value.current, 4)).isLessThan(0) ? 0 : formatEther(value.current, 4),
                  )} ${TOKEN}`}
                  value={formatNumber(
                    BigNumberJs(formatEther(value.current, 4)).isLessThan(0) ? 0 : formatEther(value.current, 4),
                  )}
                />
              </Typography>
              <EstimatedNextEraLayout
                valueTooltip={`${formatNumberWithLocale(
                  BigNumberJs(formatEther(value.after, 4)).isLessThan(0) ? 0 : formatEther(value.after, 4),
                )} ${TOKEN}`}
                value={`${formatNumber(
                  BigNumberJs(formatEther(value.after, 4)).isLessThan(0) ? 0 : formatEther(value.after, 4),
                )} ${TOKEN}`}
              ></EstimatedNextEraLayout>
            </div>
          );
        },
      },
      {
        title: <TableTitle title={t('indexer.ownStake')} />,
        key: 'ownStakeKey',
        dataIndex: 'ownStake',
        width: 150,
        render: (value: { current: string; after: string }) => {
          return (
            <div className="col-flex">
              <Typography>
                <TokenAmount
                  tooltip={`${formatNumberWithLocale(formatEther(value.current, 4))} ${TOKEN}`}
                  value={formatNumber(formatEther(value.current, 4))}
                />
              </Typography>
              <EstimatedNextEraLayout
                valueTooltip={`${formatNumberWithLocale(formatEther(value.after, 4))} ${TOKEN}`}
                value={`${formatNumber(formatEther(value.after, 4))} ${TOKEN}`}
              ></EstimatedNextEraLayout>
            </div>
          );
        },
      },
      {
        title: <TableTitle title={t('indexer.commission')} />,
        key: 'commissionKey',
        dataIndex: 'commission',
        width: 50,
        render: (value: { current: number; after: number }) => {
          return (
            <div className="col-flex">
              <Typography>{value.current}%</Typography>
              <EstimatedNextEraLayout value={`${value.after}%`}></EstimatedNextEraLayout>
            </div>
          );
        },
        sorter: (a, b) => (a.commission.current ?? 0) - (b?.commission?.current ?? 0),
      },
      {
        title: <TableTitle title={t('indexer.action')} />,
        key: 'addressKey',
        dataIndex: 'address',
        fixed: 'right' as FixedType,
        width: 50,
        align: 'center',
        render: (id: string) => {
          if (id === account) return <Typography> - </Typography>;
          const curIndexer = fetchedIndexers.data?.indexerApySummaries?.nodes?.find((i) => i?.indexerId === id);
          const delegation = delegations.data?.delegations?.nodes.find((i) => `${account}:${id}` === i?.id);

          return (
            <div className={'flex-start'}>
              <DoDelegate indexerAddress={id} variant="textBtn" indexer={curIndexer?.indexer} delegation={delegation} />
            </div>
          );
        },
      },
    ];
    return getColumns();
  }, [account, pageStartIndex]);

  React.useEffect(() => {
    if (networkClient) {
      onLoadMore(0);
    }
  }, [networkClient]);

  return (
    <div className={styles.container}>
      <div
        className={styles.tipsBanner}
        style={{
          display: closeBannerTips ? 'none' : 'flex',
        }}
      >
        <Typography variant="large" weight={600}>
          Receive rewards today as a Delegator
        </Typography>
        <CloseOutlined
          onClick={() => {
            setCloseBannerTips(true);
          }}
          style={{ position: 'absolute', cursor: 'pointer', top: 20, right: 20 }}
        />
        <Typography variant="medium" type="secondary" style={{ maxWidth: 888 }}>
          A Delegator is a non-technical network role in the SubQuery Network and is a great way to start participating
          in the SubQuery Network. This role enables Delegators to “delegate” their SQT to one or more Node Operators
          (RPC Providers or Data Indexers) and earn rewards (similar to staking).
        </Typography>

        <Typography variant="medium" type="secondary">
          To begin delegating, pick a Node Operator from below and click “Delegate”
        </Typography>

        <div className="flex" style={{ gap: 16 }}>
          <Button
            size="large"
            type="primary"
            shape="round"
            href="https://academy.subquery.network/subquery_network/delegators/introduction.html"
          >
            Learn More
          </Button>
          <Button
            ghost
            size="large"
            type="primary"
            shape="round"
            style={{ display: 'flex', gap: 10, alignItems: 'center' }}
            href="https://academy.subquery.network/subquery_network/delegators/delegating.html"
          >
            <BsCollectionPlayFill />
            How it works
          </Button>
        </div>
      </div>
      <div className={styles.indexerListHeader}>
        <Typography variant="h6" className={styles.title}>
          {t('indexer.amount', { count: fetchedIndexers.data?.indexerApySummaries?.totalCount || 0 })}
        </Typography>
        <div className={styles.indexerSearch}>
          <SearchInput
            onSearch={(value: string) => {
              setSearchIndexer(value);
              setPageStartIndex(1);
              onLoadMore(
                0,
                value
                  ? {
                      indexer: {
                        id: {
                          equalTo: value,
                        },
                      },
                    }
                  : undefined,
              );
            }}
            defaultValue={searchIndexer}
            loading={fetchedIndexers.loading || loadingList}
          />
        </div>
      </div>

      <Table
        columns={columns}
        rowKey={(record, index) => {
          return `${record?.address}${record?.controller}${index}`;
        }}
        dataSource={orderedIndexerList}
        loading={fetchedIndexers.loading || loadingList}
        pagination={{
          total: totalCounts,
          onChange: (page, pageSize) => {
            const i = (page - 1) * pageSize;
            setPageStartIndex(page);
            onLoadMore?.(i);
          },
          current: pageStartIndex,
        }}
        scroll={width <= 768 ? { x: 1600 } : undefined}
      ></Table>
    </div>
  );
};
