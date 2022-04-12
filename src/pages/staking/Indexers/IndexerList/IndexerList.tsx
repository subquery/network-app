// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Button } from '@subql/react-ui';
import { Table, TableProps } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { convertBigNumberToNumber, formatEther, toPercentage } from '../../../../utils';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { GetIndexers_indexers_nodes as Indexer } from '../../../../__generated__/GetIndexers';
import { useEra, useWeb3 } from '../../../../containers';
import styles from './IndexerList.module.css';
import { DoDelegate } from '../DoDelegate';
import { useHistory } from 'react-router';
import IndexerName from '../../../../components/IndexerDetails/IndexerName';
import { useIndexerMetadata } from '../../../../hooks';
import { TableText } from '../../../../components';

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

export const IndexerList: React.VFC<props> = ({ indexers, onLoadMore, totalCount }) => {
  const { t } = useTranslation();
  const { currentEra } = useEra();
  const { account } = useWeb3();
  const history = useHistory();

  const sortedIndexerList = (indexers ?? []).map((indexer) => {
    const convertedCommission = parseRawEraValue(indexer.commission as RawEraValue, currentEra.data?.index);
    const convertedTotalStake = parseRawEraValue(indexer.totalStake as RawEraValue, currentEra.data?.index);

    const sortedCommission = mapEraValue(convertedCommission, (v) => toPercentage(convertBigNumberToNumber(v ?? 0)));
    const sortedTotalStake = mapEraValue(convertedTotalStake, (v) => formatEther(v ?? 0));

    return { ...indexer, commission: sortedCommission, totalStake: sortedTotalStake };
  });

  const orderedIndexerList = sortedIndexerList.sort((indexerA, indexerB) =>
    indexerA.id === account ? -1 : indexerB.id === account ? 1 : 0,
  );

  const columns: TableProps<typeof sortedIndexerList[number]>['columns'] = [
    {
      title: '#',
      key: 'idx',
      width: 15,
      render: (text: string, record: any, index: number) => <Typography variant="medium">{index + 1}</Typography>,
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
      title: t('indexer.commission').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['commission', 'current'],
          key: 'currentTotalStake',
          width: 40,
          render: (val: string) => <TableText content={val || '-'} />,
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
        dataSource={orderedIndexerList}
        scroll={{ x: 1200 }}
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
