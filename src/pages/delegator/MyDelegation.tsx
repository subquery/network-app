// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { AppPageHeader, Button, Card, EmptyList, TableText, WalletRoute } from '@components';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { useEra } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '@hooks/useEraValue';
import { Spinner, TableTitle } from '@subql/components';
import { useGetFilteredDelegationsQuery } from '@subql/react-hooks';
import { formatEther, mapAsync, mergeAsync, notEmpty, renderAsync, ROUTES, TOKEN } from '@utils';
import { Table, TableProps, Tag, Typography } from 'antd';
import clsx from 'clsx';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { TFunction } from 'i18next';

import { DoUndelegate } from './DoUndelegate';
import styles from './MyDelegation.module.css';

const getColumns = (
  t: TFunction,
): TableProps<{
  value: CurrentEraValue<string>;
  indexer: string;
}>['columns'] => [
  {
    title: <TableTitle title={'#'} />,
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
        return <DoUndelegate indexerAddress={id} />;
      }
    },
  },
];

export const MyDelegation: React.FC = () => {
  const { currentEra } = useEra();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const delegating = useDelegating(account ?? '');
  const delegatingAmount = `${formatEther(delegating.data ?? BigNumber.from(0), 4)} ${TOKEN}`;

  const filterParams = { delegator: account ?? '', filterIndexer: account ?? '', offset: 0 };
  // TODO: refresh when do some actions.
  const delegations = useGetFilteredDelegationsQuery({
    variables: filterParams,
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
        loading: () => <Spinner></Spinner>,
        error: (e) => <Typography>{`Failed to load delegations: ${e.message}`}</Typography>,
        data: (data) => {
          if (!data || data.length === 0) {
            return (
              <EmptyList
                title={t('delegate.nonDelegating')}
                description={[t('delegate.nonDelegatingDesc1'), t('delegate.nonDelegatingDesc2')]}
              >
                <Button>
                  <NavLink to={ROUTES.TOP_INDEXER_NAV}>{t('delegate.title')}</NavLink>
                </Button>
              </EmptyList>
            );
          }
          return (
            <>
              <Typography.Title level={3} className={styles.header}>
                {t('delegate.totalAmount', { count: data.length || 0 })}
              </Typography.Title>
              <Table columns={getColumns(t)} dataSource={data} rowKey={'indexer'} />
            </>
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
      <WalletRoute
        componentMode
        element={
          <>
            <DelegatingCard />
            <DelegationList />
          </>
        }
      ></WalletRoute>
    </>
  );
};
