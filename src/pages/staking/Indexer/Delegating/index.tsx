// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import { DoUndelegate } from '../DoUndelegate';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
import { useDelegations, useEra } from '../../../../containers';
import { formatEther, mapAsync, mergeAsync, notEmpty, renderAsync, TOKEN } from '../../../../utils';
import { TableText } from '../../../../components';
import clsx from 'clsx';
import { parseEther } from 'ethers/lib/utils';

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
            formatEther(v ?? 0),
          ),
          indexer: delegation.indexerId,
          indexerActive: delegation?.indexer?.active,
        }))
        .filter(
          (delegation) =>
            parseEther(delegation.value.current).gt('0') || parseEther(delegation?.value?.after ?? '0').gt('0'),
        ),
    mergeAsync(delegations, currentEra),
  );

  const columns: TableProps<{
    value: CurrentEraValue<string>;
    indexer: string;
  }>['columns'] = [
    {
      title: '#',
      key: 'idx',
      width: 30,
      render: (text: string, record: any, index: number) => <TableText content={index + 1} />,
    },
    {
      title: t('indexer.title').toUpperCase(),
      dataIndex: 'indexer',
      width: 80,
      render: (text: string) => <TableText content={text} />,
    },
    {
      title: t('delegate.yourDelegateAmount').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['value', 'current'],
          key: 'currentValue',
          width: 60,
          render: (text: string) => <TableText content={`${text} ${TOKEN}`} />,
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['value', 'after'],
          key: 'afterValue',
          width: 60,
          render: (text: string) => <TableText content={`${text} ${TOKEN}`} />,
        },
      ],
    },
    {
      title: t('general.status').toUpperCase(),
      dataIndex: 'indexerActive',
      key: 'indexerActive',
      width: 60,
      render: (active: string) => {
        const tagColor = active ? 'success' : 'default';
        const tagText = active ? t('general.active').toUpperCase() : t('general.inactive').toUpperCase();

        return <Tag color={tagColor}>{tagText}</Tag>;
      },
    },
    {
      title: t('indexer.action').toUpperCase(),
      dataIndex: 'indexer',
      key: 'operation',
      fixed: 'right',
      width: 65,
      render: (id: string, record) => {
        if (id === delegator) {
          return <Typography className={clsx('grayText', styles.nonDelegateBtn)}>-</Typography>;
        } else if ((record?.value?.after ?? 0) === 0) {
          return (
            <Typography className={clsx('grayText', styles.nonDelegateBtn)}>0 delegation for next era.</Typography>
          );
        } else {
          return <DoUndelegate indexerAddress={id} availableBalance={record.value.after} />;
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
