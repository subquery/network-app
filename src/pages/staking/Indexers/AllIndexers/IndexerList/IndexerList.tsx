// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Spinner } from '@subql/react-ui';
import { TableProps } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import i18next from 'i18next';
import { extractPercentage, getOrderedAccounts, renderAsync } from '../../../../../utils';
import { CurrentEraValue } from '../../../../../hooks/useEraValue';
import { GetIndexers_indexers_nodes as Indexer } from '../../../../../__generated__/registry/GetIndexers';
import { useDelegation, useIndexer, useWeb3 } from '../../../../../containers';
import styles from './IndexerList.module.css';
import { DoDelegate } from '../../DoDelegate';
import { AntDTable, SearchInput, TableText } from '../../../../../components';
import {
  getCapacity,
  getCommission,
  getDelegated,
  getOwnStake,
  getTotalStake,
} from '../../../../../hooks/useSortedIndexer';
import { ConnectedIndexer } from '../../../../../components/IndexerDetails/IndexerName';
import { TokenAmount } from '../../../../../components/TokenAmount';

const Delegation: React.VFC<{
  indexer: string;
  totalStake: CurrentEraValue<number>;
  curEra: number | undefined;
  delegateType?: 'ownStake' | 'delegated';
  fieldKey: 'current' | 'after';
}> = ({ indexer, curEra, totalStake, delegateType = 'delegated', fieldKey }) => {
  const indexerDelegation = useDelegation(indexer, indexer);
  return (
    <>
      {renderAsync(indexerDelegation, {
        error: (error) => (
          <Typography
            className="errorText"
            variant="small"
          >{`Failed to get delegated amount: ${error.message}`}</Typography>
        ),
        loading: () => <Spinner />,
        data: (data) => {
          const ownStake = getOwnStake(data.delegation?.amount, curEra);
          const delegated = getDelegated(totalStake, ownStake);
          const eraValue = delegateType === 'delegated' ? delegated : ownStake;
          return <TokenAmount value={eraValue[fieldKey]?.toString()} />;
        },
      })}
    </>
  );
};

interface SortedIndexerListProps {
  commission: CurrentEraValue<string>;
  totalStake: CurrentEraValue<number>;
  capacity: CurrentEraValue<number>;
  __typename: 'Indexer';
  id: string;
  metadata: string | null;
  controller: string | null;
}

const getColumns = (
  account: string,
  era: number | undefined,
  viewIndexerDetail: (url: string) => void,
  pageStartIndex: number,
): TableProps<SortedIndexerListProps>['columns'] => [
  {
    title: '#',
    key: 'idx',
    width: 20,
    render: (_: string, __: any, index: number) => <TableText>{pageStartIndex + index + 1}</TableText>,
    onCell: (record: SortedIndexerListProps) => ({
      onClick: () => viewIndexerDetail(record.id),
    }),
  },
  {
    title: i18next.t('indexer.title').toUpperCase(),
    dataIndex: 'id',
    width: 80,
    render: (val: string) => <ConnectedIndexer id={val} account={account} onAddressClick={viewIndexerDetail} />,
  },
  {
    title: i18next.t('indexer.totalStake').toUpperCase(),
    children: [
      {
        title: i18next.t('general.current').toUpperCase(),
        dataIndex: ['totalStake', 'current'],
        key: 'currentTotalStake',
        width: 40,
        render: (value) => <TokenAmount value={value} />,
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
        sorter: (a, b) => a.totalStake.current - b.totalStake.current,
      },
      {
        title: i18next.t('general.next').toUpperCase(),
        dataIndex: ['totalStake', 'after'],
        key: 'currentTotalStake',
        width: 40,
        render: (value) => <TokenAmount value={value} />,
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
        sorter: (a, b) => (a.totalStake.after ?? 0) - (b.totalStake.after ?? 0),
      },
    ],
  },
  {
    title: i18next.t('indexer.ownStake').toUpperCase(),

    children: [
      {
        title: i18next.t('general.current').toUpperCase(),
        dataIndex: 'totalStake',
        key: 'currentTotalStake',
        width: 40,
        render: (value: CurrentEraValue<number>, record: any) => (
          <Delegation
            indexer={record.id}
            totalStake={value}
            fieldKey="current"
            curEra={era}
            delegateType={'ownStake'}
          />
        ),
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
      },
      {
        title: i18next.t('general.next').toUpperCase(),
        dataIndex: 'totalStake',
        key: 'currentTotalStake',
        width: 40,
        render: (value: CurrentEraValue<number>, record: any) => (
          <Delegation indexer={record.id} totalStake={value} fieldKey="after" curEra={era} delegateType={'ownStake'} />
        ),
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
      },
    ],
  },
  {
    title: i18next.t('indexer.delegated').toUpperCase(),
    children: [
      {
        title: i18next.t('general.current').toUpperCase(),
        dataIndex: 'totalStake',
        key: 'currentTotalStake',
        width: 40,
        render: (value: CurrentEraValue<number>, record: any) => (
          <Delegation indexer={record.id} totalStake={value} fieldKey="current" curEra={era} />
        ),
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
      },
      {
        title: i18next.t('general.next').toUpperCase(),
        dataIndex: 'totalStake',
        key: 'currentTotalStake',
        width: 40,
        render: (value: CurrentEraValue<number>, record: any) => (
          <Delegation indexer={record.id} totalStake={value} fieldKey="after" curEra={era} />
        ),
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
      },
    ],
  },
  {
    title: i18next.t('indexer.commission').toUpperCase(),
    children: [
      {
        title: i18next.t('general.current').toUpperCase(),
        dataIndex: ['commission', 'current'],
        key: 'currentTotalStake',
        width: 40,
        render: (value: string) => <TableText content={value || '-'} />,
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
        sorter: (a, b) => extractPercentage(a.commission.current) - extractPercentage(b.commission.current),
      },
      {
        title: i18next.t('general.next').toUpperCase(),
        dataIndex: ['commission', 'after'],
        key: 'currentTotalStake',
        width: 40,
        render: (value: string) => <TableText content={value || '-'} />,
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
        sorter: (a, b) => extractPercentage(a.commission.after ?? '0') - extractPercentage(b.commission.after ?? '0'),
      },
    ],
  },
  {
    title: i18next.t('indexer.capacity').toUpperCase(),
    children: [
      {
        title: i18next.t('general.current').toUpperCase(),
        dataIndex: ['capacity', 'current'],
        width: 40,
        render: (value: string) => <TokenAmount value={value} />,
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
      },
      {
        title: i18next.t('general.next').toUpperCase(),
        dataIndex: ['capacity', 'after'],
        width: 40,
        render: (value: string) => <TokenAmount value={value} />,
        onCell: (record) => ({
          onClick: () => viewIndexerDetail(record.id),
        }),
      },
    ],
  },
  {
    title: i18next.t('indexer.action').toUpperCase(),
    dataIndex: 'id',
    key: 'operation',
    fixed: 'right' as FixedType,
    width: 40,
    align: 'center',
    render: (id: string) => {
      if (id === account) return <Typography> - </Typography>;
      return (
        <div className={'flex-start'}>
          <DoDelegate indexerAddress={id} variant="textBtn" />
        </div>
      );
    },
  },
];

interface props {
  indexers?: Indexer[];
  totalCount?: number;
  onLoadMore?: (offset: number) => void;
  era?: number;
}

export const IndexerList: React.VFC<props> = ({ indexers, onLoadMore, totalCount, era }) => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const history = useHistory();
  const viewIndexerDetail = (id: string) => history.push(`/staking/indexers/delegate/${id}`);
  const [pageStartIndex, setPageStartIndex] = React.useState(0);

  /**
   * SearchInput logic
   */
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();
  const sortedIndexer = useIndexer({ address: searchIndexer ?? '' });

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

  /**
   * SearchInput logic end
   */

  /**
   * Sort Indexers
   */

  const rawIndexerList = searchedIndexer ?? indexers ?? [];
  const sortedIndexerList = rawIndexerList.map((indexer) => {
    const commission = getCommission(indexer.commission, era);
    const capacity = getCapacity(indexer.capacity, era);
    const totalStake = getTotalStake(indexer.totalStake, era);

    return { ...indexer, commission, capacity, totalStake };
  });

  const orderedIndexerList = getOrderedAccounts(sortedIndexerList, 'id', account);

  /**
   * Sort Indexers logic end
   */

  const columns = getColumns(account ?? '', era, viewIndexerDetail, pageStartIndex);

  return (
    <div className={styles.container}>
      <div className={styles.indexerListHeader}>
        <Typography variant="h6" className={styles.title}>
          {t('indexer.amount', { count: totalCount || indexers?.length || 0 })}
        </Typography>
        <SearchAddress />
      </div>

      <AntDTable
        customPagination
        tableProps={{ columns, rowKey: 'id', dataSource: [...orderedIndexerList], scroll: { x: 1600 } }}
        paginationProps={{
          total: searchedIndexer ? searchedIndexer.length : totalCount,
          onChange: (page, pageSize) => {
            const i = (page - 1) * pageSize;
            setPageStartIndex(i);
            onLoadMore?.(i);
          },
        }}
      />
    </div>
  );
};
