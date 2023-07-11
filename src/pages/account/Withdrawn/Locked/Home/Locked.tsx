// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components';
import { TokenAmount } from '@components/TokenAmount';
import { useWeb3 } from '@containers';
import { defaultLockPeriod, useLockPeriod } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { TableText, TableTitle } from '@subql/components';
import { WithdrawalFieldsFragment as Withdrawls } from '@subql/network-query';
import { useGetWithdrawlsQuery } from '@subql/react-hooks';
import { WithdrawalStatus } from '@subql/react-hooks/dist/graphql';
import { formatEther, LOCK_STATUS, mapAsync, mergeAsync, notEmpty, renderAsyncArray } from '@utils';
import { Table, TableProps, Tag } from 'antd';
import { BigNumber } from 'ethers';
import { t } from 'i18next';
import moment from 'moment';

import { DoWithdraw } from '../DoWithdraw';
import styles from './Locked.module.css';

interface SortedWithdrawals extends Withdrawls {
  idx: number;
  endAt: string;
  lockStatus: LOCK_STATUS;
}

const dateFormat = 'MMMM Do YY, h:mm:ss a';

const columns: TableProps<SortedWithdrawals>['columns'] = [
  {
    title: <TableTitle title={'#'} />,
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

export const Locked: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const filterParams = {
    delegator: account || '',
    status: WithdrawalStatus.ONGOING,
    offset: 0,
  };
  // TODO: refresh when do the withdrawl action.
  const withdrawals = useGetWithdrawlsQuery({ variables: filterParams });
  const lockPeriod = useLockPeriod();

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
          empty: () => <EmptyList title={t('withdrawals.noWithdrawals')} />,
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
