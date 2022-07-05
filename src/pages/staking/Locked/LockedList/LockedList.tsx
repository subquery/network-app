// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { convertStringToNumber, formatEther } from '../../../../utils';
import { GetWithdrawls_withdrawls_nodes as Withdrawls } from '../../../../__generated__/registry/GetWithdrawls';
import styles from './LockedList.module.css';
import { DoWithdraw } from '../DoWithdraw';
import moment from 'moment';
import { TableText } from '../../../../components';
import { useState } from 'react';

const dateFormat = 'MMMM Do YY, h:mm:ss a';

interface SortedWithdrawals extends Withdrawls {
  idx: number;
  endAt: string;
  status: string;
}

interface props {
  withdrawals: SortedWithdrawals[];
}

export const LockedList: React.VFC<props> = ({ withdrawals }) => {
  const { t } = useTranslation();
  const [disabled, setDisabled] = useState(false);

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
      render: (value: string) => <TableText content={`${formatEther(value)} SQT`} />,
    },
    {
      title: t('withdrawals.lockedUntil').toUpperCase(),
      dataIndex: 'lockedUntil',
      width: 80,
      render: (value: string) => <TableText content={moment(value).format(dateFormat)} />,
    },
    {
      title: t('withdrawals.status').toUpperCase(),
      dataIndex: 'status',
      width: 30,
      render: (value: string) => <TableText content={value} />,
    },
  ];

  const unlockedWithdrawals = withdrawals.filter((withdrawal) => withdrawal.endAt < moment().format());
  const availableWithdrawalsAmount = unlockedWithdrawals.reduce((sum, withdrawal) => {
    return sum + convertStringToNumber(formatEther(withdrawal.amount));
  }, 0);
  const unlockedWithdrawalsTotal = unlockedWithdrawals.length;
  const headerTitle = `${t('withdrawals.unlockedAsset', { count: unlockedWithdrawalsTotal || 0 })}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          {headerTitle}
        </Typography>
        {unlockedWithdrawalsTotal > 0 && <DoWithdraw unlockedAmount={availableWithdrawalsAmount} disabled={disabled} />}
      </div>
      <Table columns={columns} dataSource={withdrawals} rowKey="idx" />
    </div>
  );
};
