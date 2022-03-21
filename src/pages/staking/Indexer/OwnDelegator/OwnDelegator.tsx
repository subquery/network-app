// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './OwnDelegator.module.css';
import { mapEraValue, parseRawEraValue } from '../../../../hooks/useEraValue';
import { convertStringToNumber, formatEther, mapAsync, mergeAsync, renderAsyncArray } from '../../../../utils';
import { useEra, useIndexerDelegators } from '../../../../containers';

interface Props {
  indexer: string;
}

export const OwnDelegator: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const indexerDelegations = useIndexerDelegators({ id: indexer ?? '' });
  const { currentEra } = useEra();

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 30,
      render: (_: any, record: any, index: number) => (
        <Typography variant="medium" className={styles.text}>
          {index + 1}
        </Typography>
      ),
    },
    {
      title: t('delegate.delegator').toUpperCase(),
      dataIndex: 'delegator',
      width: 100,
      render: (delegator: string) => (
        <Typography variant="medium" className={styles.text}>
          {delegator === indexer ? 'You' : delegator}
        </Typography>
      ),
    },
    {
      title: t('delegate.currentEra').toUpperCase(),
      dataIndex: ['value', 'current'],
      width: 100,
      render: (value: string | number) => (
        <Typography variant="medium" className={styles.text}>{`${value ?? 0} SQT`}</Typography>
      ),
    },
    {
      title: t('delegate.nextEra').toUpperCase(),
      dataIndex: ['value', 'after'],
      width: 100,
      render: (value: string | number) => (
        <Typography variant="medium" className={styles.text}>{`${value ?? 0} SQT`}</Typography>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {renderAsyncArray(
        mapAsync(
          ([indexer, era]) =>
            indexer?.indexer?.delegations.nodes.map((delegation) => ({
              value: mapEraValue(parseRawEraValue(delegation?.amount, era?.index), (v) =>
                convertStringToNumber(formatEther(v ?? 0)),
              ),
              delegator: delegation?.delegatorAddress ?? '',
            })),
          mergeAsync(indexerDelegations, currentEra),
        ),
        {
          error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography>{t('delegate.none')}</Typography>,
          data: (data) => <Table columns={columns} dataSource={data} />,
        },
      )}
    </div>
  );
};
