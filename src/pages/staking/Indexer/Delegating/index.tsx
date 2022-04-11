// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import { DoUndelegate } from '../DoUndelegate';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { useDelegations, useEra } from '../../../../containers';
import { convertStringToNumber, formatEther, mapAsync, mergeAsync, notEmpty, renderAsync } from '../../../../utils';

interface Props {
  delegator: string;
}

export const Delegator: React.VFC<Props> = ({ delegator }) => {
  const { t } = useTranslation();
  const delegations = useDelegations({ delegator });
  const { currentEra } = useEra();

  const delegationList = mapAsync(
    ([delegations, era]) =>
      delegations?.delegations?.nodes
        .filter((delegation) => delegation?.indexerId !== delegator)
        .filter(notEmpty)
        .map((delegation) => ({
          value: mapEraValue(parseRawEraValue(delegation?.amount as RawEraValue, era?.index), (v) =>
            convertStringToNumber(formatEther(v ?? 0)),
          ),
          indexer: delegation.indexerId,
        })),
    mergeAsync(delegations, currentEra),
  );

  const columns: TableProps<{
    value: CurrentEraValue<number>;
    indexer: string;
  }>['columns'] = [
    {
      title: '#',
      key: 'idx',
      width: 30,
      align: 'center',
      render: (text: string, record: any, index: number) => <Typography>{index + 1}</Typography>,
    },
    {
      title: t('indexer.title').toUpperCase(),
      dataIndex: 'indexer',
      width: 100,
      align: 'center',
      render: (text: string) => <Typography>{text}</Typography>,
    },
    {
      title: t('delegate.yourDelegateAmount').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['value', 'current'],
          key: 'currentValue',
          width: 60,
          align: 'center',
          render: (text: string) => <Typography>{`${text} SQT`}</Typography>,
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['value', 'after'],
          key: 'afterValue',
          width: 60,
          align: 'center',
          render: (text: string) => <Typography>{`${text} SQT`}</Typography>,
        },
      ],
    },
    {
      title: 'Action',
      dataIndex: 'indexer',
      key: 'operation',
      fixed: 'right' as FixedType,
      width: 30,
      align: 'center',
      render: (id: string) => {
        if (id === delegator) {
          return <Typography>-</Typography>;
        } else {
          return <DoUndelegate indexerAddress={id} />;
        }
      },
    },
  ];

  return (
    <div className={'contentContainer'}>
      {renderAsync(delegationList, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Failed to load delegations: ${e.message}`}</Typography>,
        data: (data) => {
          if (!data || data.length === 0) return <Typography variant="h6">{t('delegate.noDelegating')}</Typography>;
          return (
            <>
              <Typography variant="h6" className={styles.header}>
                {t('delegate.totalAmount', { count: data.length || 0 })}
              </Typography>
              <Table columns={columns} dataSource={data} scroll={{ x: 800 }} rowKey={'indexer'} />
            </>
          );
        },
      })}

      {/* TODO paging delegations */}
    </div>
  );
};

export default Delegator;
