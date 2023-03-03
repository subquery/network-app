// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatEther, LOCK_STATUS } from '@utils';
import { GetWithdrawls_withdrawls_nodes as Withdrawls } from '@__generated__/registry/GetWithdrawls';
//TODO: add fragment
import styles from './LockedList.module.css';
import { DoWithdraw } from '../DoWithdraw';
import moment from 'moment';
import { TableText } from '@components';
import { BigNumber } from 'ethers';
import { TokenAmount } from '@components/TokenAmount';

const dateFormat = 'MMMM Do YY, h:mm:ss a';

interface SortedWithdrawals extends Withdrawls {
  idx: number;
  endAt: string;
  lockStatus: LOCK_STATUS;
}

interface props {
  withdrawals: SortedWithdrawals[];
}

export const LockedList: React.VFC<props> = ({ withdrawals }) => {
  const { t } = useTranslation();

  const columns: TableProps<SortedWithdrawals>['columns'] = [
    {
      title: '#',
      width: 30,
      render: (t, r, index) => <TableText content={index + 1} />,
    },
    {
      title: t('withdrawals.amount').toUpperCase(),
      dataIndex: 'amount',
      width: 100,
      render: (value: string) => <TokenAmount value={formatEther(value)} />,
    },
    {
      title: t('withdrawals.lockedUntil').toUpperCase(),
      dataIndex: 'endAt',
      width: 80,
      render: (value: string) => <TableText content={moment(value).format(dateFormat)} />,
    },
    {
      title: t('withdrawals.status').toUpperCase(),
      dataIndex: 'lockStatus',
      width: 30,
      render: (value: LOCK_STATUS) => {
        const tagColor = value === LOCK_STATUS.UNLOCK ? 'success' : 'processing';
        const tagContent = value === LOCK_STATUS.UNLOCK ? t('withdrawals.unlocked') : t('withdrawals.locked');
        return <Tag color={tagColor}>{tagContent}</Tag>;
      },
    },
  ];

  const unlockedRewards = withdrawals.filter((withdrawal) => withdrawal.lockStatus === LOCK_STATUS.UNLOCK);
  const hasUnlockedRewards = unlockedRewards?.length > 0;

  const headerTitle = `${t('withdrawals.unlockedAsset', { count: unlockedRewards?.length || 0 })}`;

  const withdrawalsAmountBigNumber = unlockedRewards.reduce((sum, withdrawal) => {
    return sum.add(BigNumber.from(withdrawal.amount));
  }, BigNumber.from('0'));

  const sortedWithdrawalsAmount = formatEther(withdrawalsAmountBigNumber);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          {headerTitle}
        </Typography>
        <DoWithdraw unlockedAmount={sortedWithdrawalsAmount} disabled={!hasUnlockedRewards} />
      </div>
      <Table columns={columns} dataSource={withdrawals} rowKey="idx" />
    </div>
  );
};
