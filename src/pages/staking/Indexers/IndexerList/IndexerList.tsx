// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Spinner } from '@subql/react-ui';
import { Table, TableProps } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { formatEther, renderAsync } from '../../../../utils';
import { CurrentEraValue } from '../../../../hooks/useEraValue';
import { GetIndexers_indexers_nodes as Indexer } from '../../../../__generated__/GetIndexers';
import { useDelegation, useWeb3 } from '../../../../containers';
import styles from './IndexerList.module.css';
import { DoDelegate } from '../DoDelegate';
import { useHistory } from 'react-router';
import { useIndexerCapacity } from '../../../../hooks';
import { TableText } from '../../../../components';
import { getCommission, getDelegated, getOwnStake, getTotalStake } from '../../../../hooks/useSortedIndexer';
import { ConnectedIndexer } from '../../../../components/IndexerDetails/IndexerName';

const Capacity: React.VFC<{ indexer: string; fieldKey: 'current' | 'after' }> = ({ indexer, fieldKey }) => {
  const indexerCapacity = useIndexerCapacity(indexer);
  return (
    <>
      {renderAsync(indexerCapacity, {
        error: (error) => (
          <Typography className="errorText" variant="small">{`Failed to get capacity: ${error.message}`}</Typography>
        ),
        loading: () => <Spinner />,
        data: (data) => {
          return <TableText content={formatEther(data[fieldKey]) || '-'} />;
        },
      })}
    </>
  );
};

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
          return <TableText content={`${eraValue[fieldKey]} SQT` || '-'} />;
        },
      })}
    </>
  );
};

interface props {
  indexers?: Indexer[];
  totalCount?: number;
  onLoadMore?: (offset: number) => void;
  era?: number;
}

export const IndexerList: React.VFC<props> = ({ indexers, onLoadMore, totalCount, era }) => {
  const { t } = useTranslation();
  // const { currentEra } = useEra();
  const { account } = useWeb3();
  const history = useHistory();

  const viewIndexerDetail = (id: string) => history.push(`/staking/indexers/delegate/${id}`);

  const sortedIndexerList = (indexers ?? []).map((indexer) => {
    const commission = getCommission(indexer.commission, era);
    const totalStake = getTotalStake(indexer.totalStake, era);

    return { ...indexer, commission, totalStake };
  });

  const orderedIndexerList = sortedIndexerList.sort((indexerA, indexerB) =>
    indexerA.id === account ? -1 : indexerB.id === account ? 1 : 0,
  );

  const columns: TableProps<typeof sortedIndexerList[number]>['columns'] = [
    {
      title: '#',
      key: 'idx',
      width: 20,
      render: (_: string, __: any, index: number) => <Typography variant="medium">{index + 1}</Typography>,
      onCell: (record) => ({
        onClick: () => viewIndexerDetail(record.id),
      }),
    },
    {
      title: t('indexer.title').toUpperCase(),
      dataIndex: 'id',
      width: 80,
      render: (val: string) => <ConnectedIndexer id={val} account={account} onAddressClick={viewIndexerDetail} />,
    },
    {
      title: t('indexer.totalStake').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['totalStake', 'current'],
          key: 'currentTotalStake',
          width: 40,
          render: (value: string) => <TableText content={value ? `${value} SQT` : '-'} />,
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['totalStake', 'after'],
          key: 'currentTotalStake',
          width: 40,
          render: (value: string) => <TableText content={value ? `${value} SQT` : '-'} />,
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
      ],
    },
    {
      title: t('indexer.ownStake').toUpperCase(),

      children: [
        {
          title: t('general.current').toUpperCase(),
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
          title: t('general.next').toUpperCase(),
          dataIndex: 'totalStake',
          key: 'currentTotalStake',
          width: 40,
          render: (value: CurrentEraValue<number>, record: any) => (
            <Delegation
              indexer={record.id}
              totalStake={value}
              fieldKey="after"
              curEra={era}
              delegateType={'ownStake'}
            />
          ),
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
      ],
    },
    {
      title: t('indexer.delegated').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
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
          title: t('general.next').toUpperCase(),
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
      title: t('indexer.commission').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['commission', 'current'],
          key: 'currentTotalStake',
          width: 40,
          render: (value: string) => <TableText content={value || '-'} />,
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['commission', 'after'],
          key: 'currentTotalStake',
          width: 40,
          render: (value: string) => <TableText content={value || '-'} />,
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
      ],
    },
    {
      title: t('indexer.capacity').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: 'id',
          width: 40,
          render: (value: string) => <Capacity indexer={value} fieldKey="current" />,
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: 'id',
          width: 40,
          render: (value: string) => <Capacity indexer={value} fieldKey="after" />,
          onCell: (record) => ({
            onClick: () => viewIndexerDetail(record.id),
          }),
        },
      ],
    },
    {
      title: t('indexer.action').toUpperCase(),
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

  return (
    <div className={styles.container}>
      <Typography variant="h6" className={styles.title}>
        {t('indexer.amount', { count: totalCount || indexers?.length || 0 })}
      </Typography>
      <Table
        columns={columns}
        rowKey="id"
        dataSource={orderedIndexerList}
        scroll={{ x: 1600 }}
        pagination={{
          total: totalCount,
          pageSizeOptions: ['10', '20'],
          onShowSizeChange: (current, pageSize) => {
            onLoadMore?.((current - 1) * pageSize);
          },
          onChange: (page, pageSize) => {
            onLoadMore?.((page - 1) * pageSize);
          },
        }}
      />
    </div>
  );
};
