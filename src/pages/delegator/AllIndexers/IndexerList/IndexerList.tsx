// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AntDTable, SearchInput, TableText } from '@components';
import { EstimatedNextEraLayout } from '@components/EstimatedNextEraLayout';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { useNetworkClient } from '@hooks';
import { CurrentEraValue } from '@hooks/useEraValue';
import { Typography } from '@subql/components';
import { TableTitle } from '@subql/components';
import { IndexerFieldsFragment as Indexer } from '@subql/network-query';
import { useGetAllDelegationsQuery, useGetIndexerQuery, useGetIndexersLazyQuery } from '@subql/react-hooks';
import { formatEther, getOrderedAccounts, mulToPercentage, TOKEN } from '@utils';
import { ROUTES } from '@utils';
import { useMount, useWhyDidYouUpdate } from 'ahooks';
import { Table, TableProps } from 'antd';
import pLimit from 'p-limit';
import { FixedType } from 'rc-table/lib/interface';

import { DoDelegate } from '../../DoDelegate';
import styles from './IndexerList.module.css';
const { INDEXER } = ROUTES;

interface SortedIndexerListProps {
  commission: CurrentEraValue<number>;
  totalStake: CurrentEraValue<number>;
  ownStake: CurrentEraValue<number>;
  delegated: CurrentEraValue<number>;
  capacity: CurrentEraValue<number>;
  __typename: 'Indexer';
  address: string;
  metadata: string | null;
  controller: string | null;
}

interface props {
  indexers?: Indexer[];
  totalCount?: number;
  era?: number;
}

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
  const [requestIndexers, fetchedIndexers] = useGetIndexersLazyQuery();
  const [pageStartIndex, setPageStartIndex] = React.useState(1);
  const [loadingList, setLoadingList] = React.useState<boolean>();
  const [indexerList, setIndexerList] = React.useState<any>();

  const delegations = useGetAllDelegationsQuery();
  /**
   * SearchInput logic
   */
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();
  const sortedIndexer = useGetIndexerQuery({ variables: { address: searchIndexer ?? '' } });

  const searchedIndexer = React.useMemo(
    () => (sortedIndexer?.data?.indexer ? [sortedIndexer?.data?.indexer] : undefined),
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
      },
      fetchPolicy: 'network-only',
    });
  };
  /**
   * SearchInput logic end
   */

  /**
   * Sort Indexers
   */

  const rawIndexerList = React.useMemo(
    () => searchedIndexer ?? fetchedIndexers.data?.indexers?.nodes ?? [],
    [fetchedIndexers, searchedIndexer],
  );

  const getSortedIndexers = async () => {
    if (rawIndexerList.length > 0) {
      try {
        setLoadingList(true);
        setIndexerList([]);

        // TODO: use batch fetch replace.
        // note networkClient.getIndexer have more sideEffects.
        const sortedIndexers = await Promise.all(
          rawIndexerList.map((indexer) => {
            return limit(() => networkClient?.getIndexer(indexer?.id || ''));
          }),
        );

        setIndexerList(sortedIndexers);
        return sortedIndexers;
      } finally {
        setLoadingList(false);
      }
    }
  };

  React.useEffect(() => {
    getSortedIndexers();
  }, [networkClient, rawIndexerList]);

  const orderedIndexerList = React.useMemo(
    () => (indexerList ? getOrderedAccounts(indexerList, 'address', account) : []),
    [account, indexerList],
  );

  /**
   * Sort Indexers logic end
   */
  const getColumns = (
    account: string,
    era: number | undefined,
    viewIndexerDetail: (url: string) => void,
    pageStartIndex: number,
  ): TableProps<SortedIndexerListProps>['columns'] => [
    {
      title: <TableTitle title={'#'} />,
      key: 'idx',
      width: 20,
      render: (_: string, __: unknown, index: number) => <TableText>{index + 1}</TableText>,
      onCell: (record: SortedIndexerListProps) => ({
        onClick: () => viewIndexerDetail(record.address),
      }),
    },
    {
      title: <TableTitle title={t('indexer.nickname')} />,
      dataIndex: 'address',
      key: 'address',
      width: 100,
      render: (val: string) =>
        val ? <ConnectedIndexer id={val} account={account} onClick={viewIndexerDetail} /> : <></>,
      onCell: (record: SortedIndexerListProps) => ({
        onClick: () => viewIndexerDetail(record.address),
      }),
    },
    {
      title: <TableTitle title={t('indexer.totalStake')} />,
      key: 'totalStakeKey',
      dataIndex: 'totalStake',
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
      title: <TableTitle title={t('indexer.commission')} />,
      key: 'commissionKey',
      dataIndex: 'commission',
      width: 100,
      render: (value: { current: number; after: number }) => {
        return (
          <div className="col-flex">
            <Typography>{mulToPercentage(value.current)}</Typography>
            <EstimatedNextEraLayout value={mulToPercentage(value.after)}></EstimatedNextEraLayout>
          </div>
        );
      },
      sorter: (a, b) => (a.commission.current ?? 0) - (b?.commission?.current ?? 0),
    },
    {
      title: <TableTitle title={t('indexer.capacity')} />,
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
      title: <TableTitle title={t('indexer.action')} />,
      key: 'addressKey',
      dataIndex: 'address',
      fixed: 'right' as FixedType,
      width: 50,
      align: 'center',
      render: (id: string) => {
        if (id === account) return <Typography> - </Typography>;
        const curIndexer = fetchedIndexers.data?.indexers?.nodes?.find((i) => i?.id === id);
        const delegation = delegations.data?.delegations?.nodes.find((i) => `${account}:${id}` === i?.id);

        return (
          <div className={'flex-start'}>
            <DoDelegate indexerAddress={id} variant="textBtn" indexer={curIndexer} delegation={delegation} />
          </div>
        );
      },
    },
  ];
  const columns = getColumns(account ?? '', era, viewIndexerDetail, pageStartIndex);
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
      <div className={styles.indexerListHeader}>
        <Typography variant="h6" className={styles.title}>
          {t('indexer.amount', { count: totalCount || fetchedIndexers.data?.indexers?.totalCount || 0 })}
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
          total: 15,
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
