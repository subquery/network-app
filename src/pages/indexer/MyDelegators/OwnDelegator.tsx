// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TableText, TableTitle } from '@subql/components';
import { renderAsyncArray, useGetIndexerDelegatorsQuery } from '@subql/react-hooks';
import { Spinner, Typography } from '@subql/components';
import { Table } from 'antd';
import { formatEther } from 'ethers/lib/utils';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useEra } from '@containers';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { TOKEN, mapAsync, convertStringToNumber, mergeAsync } from '@utils';
import styles from './OwnDelegator.module.css';

interface Props {
  indexer: string;
}

export const OwnDelegator: React.VFC<Props> = ({ indexer }) => {
  const { t } = useTranslation();
  const indexerDelegations = useGetIndexerDelegatorsQuery({ variables: { id: indexer ?? '', offset: 0 } });
  const { currentEra } = useEra();

  const columns = [
    {
      title: <TableTitle title={'#'} />,
      key: 'idx',
      width: 30,
      render: (_: any, record: any, index: number) => <TableText content={index + 1} />,
    },
    {
      title: <TableTitle title={t('delegate.delegator')} />,
      dataIndex: 'delegator',
      render: (delegator: string) => <TableText content={delegator} />,
    },
    {
      title: <TableTitle title={t('delegate.amount')} />,
      children: [
        {
          title: <TableTitle title={t('delegate.currentEra')} />,
          dataIndex: ['value', 'current'],
          render: (value: string | number) => <TableText content={`${value ?? 0} ${TOKEN}`} />,
        },
        {
          title: <TableTitle title={t('delegate.nextEra')} />,
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
