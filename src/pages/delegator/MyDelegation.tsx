// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Space, Table, TableProps, Tag, Typography } from 'antd';
import { TFunction, useTranslation } from 'react-i18next';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { AppPageHeader, Card, TableText } from '../../components';
import { COLORS, formatEther, TOKEN, mapAsync, mergeAsync, notEmpty, renderAsync } from '../../utils';
import { useDelegating } from '../../hooks/useDelegating';
import { useEra, useFilteredDelegations, useWeb3 } from '../../containers';
import styles from './MyDelegation.module.css';
import { CurrentEraValue, mapEraValue, parseRawEraValue, RawEraValue } from '../../hooks/useEraValue';
import { parseEther } from 'ethers/lib/utils';
import { TableTitle } from '../../components/TableTitle';
import { TokenAmount } from '../../components/TokenAmount';
import clsx from 'clsx';
import { BigNumber } from 'ethers';
import { DoUndelegate } from '../staking/Indexer/DoUndelegate';

// TODO: Move to en.ts once reorg ready
const myDelegationDesc =
  'View all Indexers you have delegated your kSQT tokens to. In return for delegating, you will earn rewards in kSQT from the rewards pool.';

const MyDelegationDesc = () => (
  <Space>
    <AiOutlineInfoCircle className="flex" color={COLORS.primary} /> {myDelegationDesc}
  </Space>
);

const getColumns = (
  delegator: string | undefined,
  t: TFunction<'translation', undefined>,
): TableProps<{
  value: CurrentEraValue<string>;
  indexer: string;
}>['columns'] => [
  {
    title: '#',
    key: 'idx',
    width: 30,
    render: (_: string, __: any, index: number) => <TableText content={index + 1} />,
  },
  {
    title: <TableTitle title={t('indexer.title')} />,
    dataIndex: 'indexer',
    width: 30,
    render: (text: string) => <TableText content={text} />,
  },
  {
    title: <TableTitle title={t('delegate.yourDelegateAmount')} />,
    width: 120,
    children: [
      {
        title: t('general.current').toUpperCase(),
        dataIndex: ['value', 'current'],
        key: 'currentValue',
        render: (text: string) => <TokenAmount value={text} />,
      },
      {
        title: t('general.next').toUpperCase(),
        dataIndex: ['value', 'after'],
        key: 'afterValue',
        render: (text: string) => <TokenAmount value={text} />,
      },
    ],
  },
  {
    title: <TableTitle title={t('general.status')} />,
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
    title: <TableTitle title={t('indexer.action')} />,
    dataIndex: 'indexer',
    key: 'operation',
    fixed: 'right',
    width: 65,
    render: (id: string, record) => {
      if ((record?.value?.after ?? 0) === 0) {
        return <Typography className={clsx('grayText', styles.nonDelegateBtn)}>0 delegation for next era.</Typography>;
      } else {
        return <DoUndelegate indexerAddress={id} availableBalance={record.value.after} />;
      }
    },
  },
];

// TODO: Deal with update after success contract tx -> push notification
export const MyDelegation: React.VFC = () => {
  const { currentEra } = useEra(); // TODO: Replace when container upgrade
  const { t } = useTranslation();
  const { account } = useWeb3();
  const delegating = useDelegating(account ?? '');
  const refetchDelegating = () => delegating.refetch(true);
  const delegatingAmount = `${formatEther(delegating.data ?? BigNumber.from(0), 4)} ${TOKEN}`;
  console.log('account', account);

  const delegations = useFilteredDelegations({ delegator: account ?? '', filterIndexer: account ?? '' });
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
    <div className="contentContainer">
      {renderAsync(delegationList, {
        error: (e) => <Typography>{`Failed to load delegations: ${e.message}`}</Typography>,
        data: (data) => {
          if (!data || data.length === 0) return <Typography.Title>{t('delegate.noDelegating')}</Typography.Title>;
          return (
            <>
              <Typography.Title level={3} className={styles.header}>
                {t('delegate.totalAmount', { count: data.length || 0 })}
              </Typography.Title>
              <Table columns={getColumns(account ?? '', t)} dataSource={data} rowKey={'indexer'} />
            </>
          );
        },
      })}
    </div>
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
      <AppPageHeader title={t('delegate.delegating')} />
      <MyDelegationDesc />
      <DelegatingCard />
      <DelegationList />
    </>
  );
};
