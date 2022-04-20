// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Button, Spinner } from '@subql/react-ui';
import { Table, TableProps } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { formatEther, renderAsync } from '../../../../utils';
import { CurrentEraValue } from '../../../../hooks/useEraValue';
import { GetIndexers_indexers_nodes as Indexer } from '../../../../__generated__/GetIndexers';
import { useDelegation, useEra, useWeb3 } from '../../../../containers';
import styles from './IndexerList.module.css';
import { DoDelegate } from '../DoDelegate';
import { useHistory } from 'react-router';
import IndexerName from '../../../../components/IndexerDetails/IndexerName';
import { useIndexerCapacity, useIndexerMetadata } from '../../../../hooks';
import { TableText } from '../../../../components';
import { getCommission, getDelegated, getOwnStake, getTotalStake } from '../../../../hooks/useSortedIndexer';

interface props {
  indexers?: Indexer[];
  totalCount?: number;
  onLoadMore?: (offset: number) => void;
}

const ConnectedIndexer: React.VFC<{ id: string; account?: string | null }> = ({ id, account }) => {
  const asyncMetadata = useIndexerMetadata(id);

  return (
    <IndexerName
      name={id === account ? 'You' : asyncMetadata.data?.name}
      image={asyncMetadata.data?.image}
      address={id}
    />
  );
};

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

const TotalDelegated: React.VFC<{
  indexer: string;
  totalStake: CurrentEraValue<number>;
  curEra: number | undefined;
  fieldKey: 'current' | 'after';
}> = ({ indexer, curEra, totalStake, fieldKey }) => {
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
          const totalDelegations = getDelegated(totalStake, ownStake);
          return <TableText content={`${totalDelegations[fieldKey]} SQT` || '-'} />;
        },
      })}
    </>
  );
};

export const IndexerList: React.VFC<props> = ({ indexers, onLoadMore, totalCount }) => {
  const { t } = useTranslation();
  const { currentEra } = useEra();
  const { account } = useWeb3();
  const history = useHistory();

  const sortedIndexerList = (indexers ?? []).map((indexer) => {
    const commission = getCommission(indexer.commission, currentEra.data?.index);
    const totalStake = getTotalStake(indexer.totalStake, currentEra.data?.index);

    return { ...indexer, commission, totalStake };
  });

  const orderedIndexerList = sortedIndexerList.sort((indexerA, indexerB) =>
    indexerA.id === account ? -1 : indexerB.id === account ? 1 : 0,
  );

  const columns: TableProps<typeof sortedIndexerList[number]>['columns'] = [
    {
      title: '#',
      key: 'idx',
      width: 15,
      render: (_: string, __: any, index: number) => <Typography variant="medium">{index + 1}</Typography>,
    },
    {
      title: t('indexer.title').toUpperCase(),
      dataIndex: 'id',
      width: 60,
      render: (val: string) => <ConnectedIndexer id={val} account={account} />,
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
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['totalStake', 'after'],
          key: 'currentTotalStake',
          width: 40,
          render: (value: string) => <TableText content={value ? `${value} SQT` : '-'} />,
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
            <TotalDelegated indexer={record.id} totalStake={value} fieldKey="current" curEra={currentEra.data?.index} />
          ),
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: 'totalStake',
          key: 'currentTotalStake',
          width: 40,
          render: (value: CurrentEraValue<number>, record: any) => (
            <TotalDelegated indexer={record.id} totalStake={value} fieldKey="after" curEra={currentEra.data?.index} />
          ),
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
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['commission', 'after'],
          key: 'currentTotalStake',
          width: 40,
          render: (value: string) => <TableText content={value || '-'} />,
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
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: 'id',
          width: 40,
          render: (value: string) => <Capacity indexer={value} fieldKey="after" />,
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
          <div className={styles.actionBtns}>
            <Button
              label="View"
              size="medium"
              className={'textBtn'}
              onClick={() => history.push(`/staking/indexers/delegate/${id}`)}
            />
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
        rowKey="idx"
        dataSource={orderedIndexerList}
        scroll={{ x: 1600 }}
        pagination={{
          total: totalCount,
          pageSize: 10,
          onChange: (page, pageSize) => {
            onLoadMore?.((page - 1) * pageSize);
          },
        }}
      />
    </div>
  );
};
