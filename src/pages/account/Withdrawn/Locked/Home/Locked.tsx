// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import { Table, TableProps, Tag } from 'antd';
import moment from 'moment';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '@containers';
import { useGetWithdrawlsQuery } from '@subql/react-hooks';
import { defaultLockPeriod, useLockPeriod } from '@hooks';
import { formatEther, LOCK_STATUS, mapAsync, mergeAsync, notEmpty, renderAsyncArray } from '@utils';
import { BigNumber } from 'ethers';
import styles from './Locked.module.css';
import { WithdrawalStatus } from '@subql/react-hooks/dist/graphql';
import { TokenAmount } from '@components/TokenAmount';
import { TableText, TableTitle } from '@subql/components';
import { t } from 'i18next';
import { WithdrawalFieldsFragment as Withdrawls } from '@subql/network-query';
import { DoWithdraw } from '../DoWithdraw';
import { SUB_WITHDRAWALS } from '@containers/IndexerRegistryProjectSub';
import { Empty } from 'antd';

interface SortedWithdrawals extends Withdrawls {
  idx: number;
  endAt: string;
  lockStatus: LOCK_STATUS;
}

const dateFormat = 'MMMM Do YY, h:mm:ss a';

const columns: TableProps<SortedWithdrawals>['columns'] = [
  {
    title: '#',
    width: '10%',
    render: (t, r, index) => <TableText content={index + 1} />,
  },
  {
    title: <TableTitle title={t('withdrawals.amount')} />,
    dataIndex: 'amount',
    width: '25%',
    render: (value: string) => <TokenAmount value={formatEther(value)} />,
  },
  {
    title: <TableTitle title={t('withdrawals.type')} />,
    dataIndex: 'type',
    width: '25%',
    render: (value: string) => <TableText>{value}</TableText>,
  },
  {
    title: <TableTitle title={t('withdrawals.lockedUntil')} />,
    dataIndex: 'endAt',
    width: '25%',
    render: (value: string) => <TableText content={moment(value).format(dateFormat)} />,
  },
  {
    title: <TableTitle title={t('withdrawals.status')} />,
    dataIndex: 'lockStatus',
    width: '15%',
    render: (value: LOCK_STATUS) => {
      const tagColor = value === LOCK_STATUS.UNLOCK ? 'success' : 'processing';
      const tagContent = value === LOCK_STATUS.UNLOCK ? t('withdrawals.unlocked') : t('withdrawals.locked');
      return <Tag color={tagColor}>{tagContent}</Tag>;
    },
  },
];

export const Locked: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const filterParams = { delegator: account || '', status: WithdrawalStatus.ONGOING, offset: 0 };
  const withdrawals = useGetWithdrawlsQuery({ variables: filterParams });
  const lockPeriod = useLockPeriod();
  const emptyListText = {
    emptyText: <Empty description={t('withdrawals.noWithdrawals')} image={Empty.PRESENTED_IMAGE_SIMPLE} />,
  };

  withdrawals.subscribeToMore({
    document: SUB_WITHDRAWALS,
    variables: filterParams,
    updateQuery: (prev, { subscriptionData }) => {
      if (subscriptionData.data) {
        withdrawals.refetch(filterParams);
      }
      return prev;
    },
  });

  return (
    <div className={styles.withdrawnContainer}>
      {renderAsyncArray(
        mapAsync(
          ([withdrawlsResult, lockPeriod]) =>
            withdrawlsResult?.withdrawls?.nodes.filter(notEmpty).map((withdrawal, idx) => {
              const utcStartAt = moment.utc(withdrawal?.startTime);
              const utcEndAt = moment.utc(utcStartAt).add(lockPeriod || defaultLockPeriod, 'second');
              const lockStatus = moment.utc() > utcEndAt ? LOCK_STATUS.UNLOCK : LOCK_STATUS.LOCK;
              return { ...withdrawal, endAt: utcEndAt.local().format(), lockStatus, idx };
            }),
          mergeAsync(withdrawals, lockPeriod),
        ),
        {
          error: (e) => <Typography>{`Error: Fail to get Indexers ${e.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Table columns={columns} locale={emptyListText} />,
          data: (data) => {
            const sortedData = data.sort((a, b) => moment(b.endAt).unix() - moment(a.endAt).unix());
            const unlockedRewards = data.filter((withdrawal) => withdrawal.lockStatus === LOCK_STATUS.UNLOCK);
            const hasUnlockedRewards = unlockedRewards?.length > 0;
            const withdrawalsAmountBigNumber = unlockedRewards.reduce((sum, withdrawal) => {
              return sum.add(BigNumber.from(withdrawal.amount));
            }, BigNumber.from('0'));

            const headerTitle = `${t('withdrawals.unlockedAsset', { count: unlockedRewards?.length || 0 })}`;
            const sortedWithdrawalsAmount = formatEther(withdrawalsAmountBigNumber);

            return (
              <div className={styles.container}>
                <div className={styles.header}>
                  <Typography variant="h6" className={styles.title}>
                    {headerTitle}
                  </Typography>
                  <DoWithdraw unlockedAmount={sortedWithdrawalsAmount} disabled={!hasUnlockedRewards} />
                </div>
                <Table columns={columns} dataSource={sortedData} rowKey="idx" />
              </div>
            );
          },
        },
      )}
    </div>
  );
};
