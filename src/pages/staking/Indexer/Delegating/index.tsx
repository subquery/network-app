// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table } from 'antd';
import { FixedType } from 'rc-table/lib/interface';
import { useTranslation } from 'react-i18next';
import styles from './index.module.css';
import { DoUndelegate } from '../DoUndelegate';
import { mapEraValue, parseRawEraValue, RawEraValue } from '../../../../hooks/useEraValue';
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
      delegations?.delegations?.nodes.filter(notEmpty).map((delegation) => ({
        value: mapEraValue(parseRawEraValue(delegation?.amount as RawEraValue, era?.index), (v) =>
          convertStringToNumber(formatEther(v ?? 0)),
        ),
        indexer: delegation.indexerAddress,
      })),
    mergeAsync(delegations, currentEra),
  );

  console.log('delegationList', delegationList);

  const columns = [
    {
      title: '#',
      key: 'idx',
      width: 30,
      render: (text: string, record: any, index: number) => <div>{index + 1}</div>,
    },
    {
      title: t('indexer.title').toUpperCase(),
      dataIndex: 'indexer',
      width: 200,
    },
    {
      title: t('delegate.yourDelegateAmount').toUpperCase(),
      children: [
        {
          title: t('general.current').toUpperCase(),
          dataIndex: ['value', 'current'],
          key: 'currentValue',
          width: 80,
        },
        {
          title: t('general.next').toUpperCase(),
          dataIndex: ['value', 'after'],
          key: 'afterValue',
          width: 80,
        },
      ],
    },
    {
      title: 'Action',
      dataIndex: 'indexer',
      key: 'operation',
      fixed: 'right' as FixedType,
      width: 60,
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
    <div className={styles.container}>
      {renderAsync(delegationList, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Failed to load delegations: ${e.message}`}</Typography>,
        data: (data) => {
          console.log('data', data);
          if (!data || data.length === 0) return <Typography variant="h5">{t('delegate.noDelegating')}</Typography>;
          return (
            <>
              <Typography variant="h6" className={styles.header}>
                {`You have total ${delegations.data?.delegations?.totalCount || 0} delegation(s)`}
              </Typography>
              <Table columns={columns} dataSource={data} scroll={{ x: 800 }} />
            </>
          );
        },
      })}

      {/* TODO paging delegations */}
    </div>
  );
};

export default Delegator;
