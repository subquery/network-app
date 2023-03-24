// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OwnDelegator.module.css';
import { mapEraValue, parseRawEraValue } from '../../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, mapAsync, mergeAsync, renderAsyncArray, TOKEN } from '../../../../utils';
import { useEra, useIndexerDelegators } from '../../../../containers';
import { TableText } from '../../../../components';
import { TableTitle } from '@subql/components';

interface Props {
  indexer: string;
}

export const OwnDelegator: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const indexerDelegations = useIndexerDelegators({ id: indexer ?? '' });
  const { currentEra } = useEra();

  const columns = [
    {
      title: <TableTitle title={'#'} />,
      key: 'idx',
      width: 30,
      render: (_: any, record: any, index: number) => <TableText content={index + 1} />,
    },
    {
      title: <TableTitle title={t('delegate.delegator').toUpperCase()} />,
      dataIndex: 'delegator',
      render: (delegator: string) => <TableText content={delegator} />,
    },
    {
      title: <TableTitle title={t('delegate.amount').toUpperCase()} />,
      children: [
        {
          title: <TableTitle title={t('delegate.currentEra').toUpperCase()} />,
          dataIndex: ['value', 'current'],
          render: (value: string | number) => <TableText content={`${value ?? 0} ${TOKEN}`} />,
        },
        {
          title: <TableTitle title={t('delegate.nextEra').toUpperCase()} />,
          dataIndex: ['value', 'after'],
          render: (value: string | number) => <TableText content={`${value ?? 0} ${TOKEN}`} />,
        },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      {renderAsyncArray(
        mapAsync(
          ([sortedIndexer, era]) =>
            sortedIndexer?.indexer?.delegations.nodes
              .map((delegation) => ({
                value: mapEraValue(parseRawEraValue(delegation?.amount, era?.index), (v) =>
                  convertStringToNumber(formatEther(v ?? 0)),
                ),
                delegator: delegation?.delegatorId ?? '',
              }))
              .filter((delegation) => delegation.value.current !== 0 || delegation.value.after !== 0),
          mergeAsync(indexerDelegations, currentEra),
        ),
        {
          error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography>{t('delegate.none')}</Typography>,
          data: (data) => <Table columns={columns} dataSource={data} rowKey={'delegator'} />,
        },
      )}
    </div>
  );
};
