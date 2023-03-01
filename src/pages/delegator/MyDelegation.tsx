// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Table, TableProps, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { BigNumber } from 'ethers';
import { useGetFilteredDelegationsQuery } from '@subql/react-hooks';
import { AppPageHeader, Button, Card, EmptyList, TableText } from '@components';
import { formatEther, TOKEN, mapAsync, mergeAsync, notEmpty, renderAsync, ROUTES } from '@utils';
import { useDelegating } from '@hooks/useDelegating';
import { useEra, useWeb3 } from '@containers';
import styles from './MyDelegation.module.css';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '@hooks/useEraValue';
import { parseEther } from 'ethers/lib/utils';
import { TableTitle } from '@components/TableTitle';
import { TokenAmount } from '@components/TokenAmount';
import { SUB_DELEGATIONS } from '@containers/IndexerRegistryProjectSub';
import { DoUndelegate } from './DoUndelegate';

const getColumns = (
  t: any,
): TableProps<{
  value: CurrentEraValue<string>;
  indexer: string;
}>['columns'] => [
  {
    title: '#',
    key: 'idx',
    width: 50,
    render: (_: string, __: any, index: number) => <TableText content={index + 1} />,
  },
  {
    title: <TableTitle title={t('indexer.title')} />,
    dataIndex: 'indexer',
    width: 250,
    render: (text: string) => <TableText content={text} />,
  },
  {
    title: <TableTitle title={t('delegate.yourDelegateAmount')} />,
    width: 200,
    children: [
      {
        title: <TableTitle title={t('delegate.currentEra')} />,
        dataIndex: ['value', 'current'],
        key: 'currentValue',
        width: 100,
        render: (text: string) => <TokenAmount value={text} />,
      },
      {
        title: <TableTitle title={t('delegate.nextEra')} />,
        dataIndex: ['value', 'after'],
        key: 'afterValue',
        width: 100,
        render: (text: string) => <TokenAmount value={text} />,
      },
    ],
  },
  {
    title: <TableTitle title={t('general.status')} />,
    dataIndex: 'indexerActive',
    key: 'indexerActive',
    width: 100,
    render: (active: string) => {
      const tagColor = active ? 'success' : 'default';
      const tagText = active ? t('general.active').toUpperCase() : t('general.inactive').toUpperCase();

      return <Tag color={tagColor}>{tagText}</Tag>;
    },
  },
  {
    title: <TableTitle title={t('indexer.action')} />,
    dataIndex: 'indexer',
    key: 'operation',
    fixed: 'right',
    width: 100,
    render: (id: string, record) => {
      if ((record?.value?.after ?? 0) === 0) {
        return <Typography className={clsx('grayText', styles.nonDelegateBtn)}>0 delegation for next era.</Typography>;
      } else {
        return <DoUndelegate indexerAddress={id} availableBalance={record.value.after} />;
      }
    },
  },
];

export const MyDelegation: React.VFC = () => {
  const { currentEra } = useEra(); // TODO: Replace when container upgrade
  const { t } = useTranslation();
  const { account } = useWeb3();
  const delegating = useDelegating(account ?? '');
  const refetchDelegating = () => delegating.refetch(true);
  const delegatingAmount = `${formatEther(delegating.data ?? BigNumber.from(0), 4)} ${TOKEN}`;

  const filterParams = { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 };
  const delegations = useGetFilteredDelegationsQuery({
    variables: filterParams,
  });

  delegations.subscribeToMore({
    document: SUB_DELEGATIONS,
    variables: filterParams,
    updateQuery: (prev, { subscriptionData }) => {
      if (subscriptionData.data) {
        delegations.refetch(filterParams);
      }
      return prev;
    },
  });

  const delegationList = mapAsync(
    ([delegations, era]) =>
      delegations?.delegations?.nodes
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

  const DelegationList = () => (
    <>
      {renderAsync(delegationList, {
        error: (e) => <Typography>{`Failed to load delegations: ${e.message}`}</Typography>,
        data: (data) => {
          if (!data || data.length === 0) {
            return (
              <EmptyList
                title={t('delegate.nonDelegating')}
                description={[t('delegate.nonDelegatingDesc1'), t('delegate.nonDelegatingDesc2')]}
              >
                <Button href={ROUTES.TOP_INDEXER_NAV}>{t('delegate.title')}</Button>
              </EmptyList>
            );
          }
          return (
            <div className="contentContainer">
              <Typography.Title level={3} className={styles.header}>
                {t('delegate.totalAmount', { count: data.length || 0 })}
              </Typography.Title>
              <Table columns={getColumns(t)} dataSource={data} rowKey={'indexer'} />
            </div>
          );
        },
      })}
    </>
  );

  const DelegatingCard = () => {
    return (
      <div className={styles.delegatingCard}>
        <Card title={t('delegate.delegationAmountTitle')} value={delegatingAmount} />
      </div>
    );
  };

  return (
    <>
      <AppPageHeader title={t('delegate.delegating')} desc={t('delegate.delegationDesc')} />
      <DelegatingCard />
      <DelegationList />
    </>
  );
};
