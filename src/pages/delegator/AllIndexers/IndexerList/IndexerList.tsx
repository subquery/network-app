// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BsCollectionPlayFill } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { APYTooltip, SearchInput } from '@components';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { useNetworkClient } from '@hooks';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { CurrentEraValue, Indexer } from '@subql/network-clients';
import { IndexerApySummariesOrderBy } from '@subql/network-query';
import {
  useGetAllDelegationsQuery,
  useGetAllIndexerByApyLazyQuery,
  useGetAllIndexerByApyQuery,
} from '@subql/react-hooks';
import { formatEther, getOrderedAccounts, notEmpty, TOKEN } from '@utils';
import { ROUTES } from '@utils';
import { useMount } from 'ahooks';
import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import BigNumberJs from 'bignumber.js';
import pLimit from 'p-limit';
import { FixedType } from 'rc-table/lib/interface';

import { DoDelegate } from '../../DoDelegate';
import styles from './IndexerList.module.css';

const { INDEXER } = ROUTES;

interface props {
  totalCount?: number;
  era?: number;
}

type IndexerWithApy = Indexer & { indexerApy: string; delegatorApy: string; apyEra: number };

const limit = pLimit(5);

// TODO: `useGetIndexerQuery` has been used by DoDelegate
// TODO: update indexer detail Page once ready
export const IndexerList: React.FC<props> = ({ totalCount, era }) => {
  const { t } = useTranslation();
  const networkClient = useNetworkClient();
  const { account } = useWeb3();
  const navigate = useNavigate();
  const viewIndexerDetail = (id: string) => {
    navigate(`/${INDEXER}/${id}`);
  };
  const [requestIndexers, fetchedIndexers] = useGetAllIndexerByApyLazyQuery();
  const [pageStartIndex, setPageStartIndex] = React.useState(1);
  const [loadingList, setLoadingList] = React.useState<boolean>();
  const [indexerList, setIndexerList] = React.useState<IndexerWithApy[]>([]);
  const { getDisplayedCommission } = useMinCommissionRate();

  const delegations = useGetAllDelegationsQuery();
  /**
   * SearchInput logic
   */
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();
  const sortedIndexer = useGetAllIndexerByApyQuery({
    variables: {
      offset: 0,
      first: 100,
      filter: {
        indexer: {
          id: {
            equalTo: searchIndexer,
          },
        },
      },
    },
  });

  const searchedIndexer = React.useMemo(
    () => (sortedIndexer.data?.indexerApySummaries ? sortedIndexer.data?.indexerApySummaries.nodes : undefined),
    [sortedIndexer],
  );

  const SearchAddress = () => (
    <div className={styles.indexerSearch}>
      <SearchInput
        onSearch={(value: string) => setSearchIndexer(value)}
        defaultValue={searchIndexer}
        loading={sortedIndexer.loading}
        emptyResult={!searchedIndexer}
      />
    </div>
  );
  const onLoadMore = (offset: number) => {
    requestIndexers({
      variables: {
        offset,
        first: 10,
        orderBy: [IndexerApySummariesOrderBy.DELEGATOR_APY_DESC],
      },
    });
  };
  /**
   * SearchInput logic end
   */

  /**
   * Sort Indexers
   */

  const rawIndexerList = React.useMemo(
    () => searchedIndexer ?? fetchedIndexers.data?.indexerApySummaries?.nodes ?? [],
    [fetchedIndexers.data?.indexerApySummaries?.nodes, searchedIndexer],
  );

  const totalCounts = React.useMemo(() => {
    return fetchedIndexers.data?.indexerApySummaries?.totalCount || totalCount;
  }, [fetchedIndexers.data?.indexerApySummaries?.totalCount, totalCount]);

  const getSortedIndexers = async () => {
    if (rawIndexerList.length > 0) {
      try {
        setLoadingList(true);
        setIndexerList([]);

        // TODO: use batch fetch replace.
        // note networkClient.getIndexer have more sideEffects.
        const sortedIndexers = await Promise.all(
          rawIndexerList.map((indexer) => {
            return limit(() =>
              networkClient?.getIndexer(indexer?.indexerId || '', undefined, indexer?.indexer || undefined),
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
      } finally {
        setLoadingList(false);
      }
    }
  };

  React.useEffect(() => {
    getSortedIndexers();
  }, [networkClient, rawIndexerList]);

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
    /**
     * Sort Indexers logic end
     */
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
                'This is the estimated APY rewarded to Delegators of this Node Operator from the last Era'
              }
            />
          </Typography>
        ),
        key: 'delegatorApy',
        dataIndex: 'delegatorApy',
        width: '100px',
        render: (value: string) => {
          return <Typography>{BigNumberJs(formatEther(value)).multipliedBy(100).toFixed(2)} %</Typography>;
        },
      },
      {
        title: <TableTitle title={t('indexer.delegated')} />,
        key: 'delegatedKey',
        dataIndex: 'delegated',
        width: 100,
        render: (value: { current: string; after: string }) => {
          return (
            <div className="col-flex">
              <Typography>
                <TokenAmount value={formatEther(value.current, 4)} />
              </Typography>
              <EstimatedNextEraLayout value={`${formatEther(value.after, 4)} ${TOKEN}`}></EstimatedNextEraLayout>
            </div>
          );
        },
      },
      {
        title: <TableTitle title="Remaining capacity" />,
        key: 'capacityKey',
        dataIndex: 'capacity',
        width: 100,
        render: (value: { current: string; after: string }) => {
          return (
            <div className="col-flex">
              <Typography>
                <TokenAmount value={formatEther(value.current, 4)} />
              </Typography>
              <EstimatedNextEraLayout value={`${formatEther(value.after, 4)} ${TOKEN}`}></EstimatedNextEraLayout>
            </div>
          );
        },
      },
      {
        title: <TableTitle title={t('indexer.ownStake')} />,
        key: 'ownStakeKey',
        dataIndex: 'ownStake',
        width: 100,
        render: (value: { current: string; after: string }) => {
          return (
            <div className="col-flex">
              <Typography>
                <TokenAmount value={formatEther(value.current, 4)} />
              </Typography>
              <EstimatedNextEraLayout value={`${formatEther(value.after, 4)} ${TOKEN}`}></EstimatedNextEraLayout>
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
  }, [account, era, pageStartIndex]);
  const isLoading = React.useMemo(() => {
    return (
      !(orderedIndexerList?.length > 0) && (loadingList || sortedIndexer.loading || (totalCount && totalCount > 0))
    );
  }, [orderedIndexerList, loadingList, sortedIndexer.loading, totalCount]);

  useMount(() => {
    onLoadMore(0);
  });

  return (
    <div className={styles.container}>
      <div className={styles.tipsBanner}>
        <Typography variant="large" weight={600}>
          Receive rewards today as a Delegator
        </Typography>

        <Typography variant="medium" type="secondary" style={{ maxWidth: 888 }}>
          A Delegator is a non-technical network role in the SubQuery Network and is a great way to start participating
          in the SubQuery Network. This role enables Delegators to “delegate” their SQT to one or more Node Operator
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
          {t('indexer.amount', { count: totalCount || fetchedIndexers.data?.indexerApySummaries?.totalCount || 0 })}
        </Typography>
        <SearchAddress />
      </div>

      <Table
        columns={columns}
        rowKey={(record, index) => {
          return `${record?.address}${record?.controller}${index}`;
        }}
        dataSource={orderedIndexerList}
        scroll={{ x: 1600 }}
        loading={!!isLoading}
        pagination={{
          total: totalCounts,
          onChange: (page, pageSize) => {
            const i = (page - 1) * pageSize;
            setPageStartIndex(page);
            onLoadMore?.(i);
          },
          current: pageStartIndex,
        }}
      ></Table>
    </div>
  );
};
