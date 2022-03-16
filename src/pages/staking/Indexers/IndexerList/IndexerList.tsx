// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography, Button } from '@subql/react-ui';
import { Table } from 'antd';
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

interface props {
  indexers: Indexer[];
}

export const IndexerList: React.VFC<props> = ({ indexers }) => {
  const { t } = useTranslation();
  const { currentEra } = useEra();
  const { account } = useWeb3();
  const history = useHistory();

  const sortedIndexerList = indexers.map((indexer) => {
    const convertedCommission = parseRawEraValue(indexer.commission as RawEraValue, currentEra.data?.index);
    const convertedTotalStake = parseRawEraValue(indexer.totalStake as RawEraValue, currentEra.data?.index);

    const sortedCommission = mapEraValue(convertedCommission, (v) => toPercentage(convertBigNumberToNumber(v ?? 0)));
    const sortedTotalStake = mapEraValue(convertedTotalStake, (v) => formatEther(v ?? 0));

    return { ...indexer, commission: sortedCommission, totalStake: sortedTotalStake };
  });

  const orderedIndexerList = sortedIndexerList.sort((indexerA) => (indexerA.id === account ? -1 : 1));

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 30,
      render: (text: string, record: any, index: number) => <Typography variant="medium">{index + 1}</Typography>,
    },
    {
      title: t('indexer.title').toUpperCase(),
      dataIndex: 'id',
      width: 150,
      render: (val: string) => {
        return <Typography variant="medium">{val === account ? 'You' : val}</Typography>;
      },
    },
    {
      title: t('indexer.totalStake').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['totalStake', 'current'],
          key: 'currentTotalStake',
          width: 70,
          render: (val: string) => <Typography variant="medium">{val ?? '-'}</Typography>,
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['totalStake', 'after'],
          key: 'currentTotalStake',
          width: 70,
          render: (val: string) => <Typography variant="medium">{val ?? '-'}</Typography>,
        },
      ],
    },
    {
      title: t('indexer.commission').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['totalStake', 'current'],
          key: 'currentTotalStake',
          width: 70,
          render: (val: string) => <Typography variant="medium">{val ?? '-'}</Typography>,
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['totalStake', 'after'],
          key: 'currentTotalStake',
          width: 70,
          render: (val: string) => <Typography variant="medium">{val ?? '-'}</Typography>,
        },
      ],
    },
    {
      title: 'Action',
      dataIndex: 'id',
      key: 'operation',
      fixed: 'right' as FixedType,
      width: 110,
      render: (id: string) => {
        if (id === account) return <Typography> - </Typography>;
        return (
          <div className={styles.actionBtns}>
            <Button label="View" size="medium" className={styles.btn} href={`/staking/indexers/delegate/${id}`} />
            <DoDelegate indexerAddress={id} />
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <Typography variant="h6" className={styles.title}>
        There are {indexers.length || 0} indexer(s)
      </Typography>
      <Table columns={columns} dataSource={orderedIndexerList} scroll={{ x: 900 }} />
    </div>
  );
};
