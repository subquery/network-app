// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { formatEther } from '../../../../utils';
import { GetWithdrawls_withdrawls_nodes as Withdrawals } from '../../../../__generated__/GetWithdrawls';
import styles from './LockedList.module.css';
import { DoWithdraw } from '../DoWithdraw';
import moment from 'moment';

const dateFormat = 'MMMM Do YY, h:mm:ss a';

// TODO: Wait for design confirm the finalized tableCell style
const TableCellText = ({ children }: { children: React.ReactChild | React.ReactChildren }) => (
  <Typography className={styles.tableCell} variant="medium">
    {children}
  </Typography>
);

interface SortedWithdrawals extends Withdrawals {
  idx: number;
  startAt: string;
  endAt: string;
  status: string;
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
      align: 'center',
      render: (t, r, index) => <TableCellText>{index + 1}</TableCellText>,
    },
    {
      title: t('withdrawals.amount').toUpperCase(),
      dataIndex: 'amount',
      width: 120,
      align: 'center',
      render: (val: string) => <TableCellText>{`${formatEther(val)} SQT`}</TableCellText>,
    },

    {
      title: t('withdrawals.startAt').toUpperCase(),
      dataIndex: 'startAt',
      width: 80,
      align: 'center',
      render: (val: string) => <TableCellText>{moment(val).format(dateFormat)}</TableCellText>,
    },
    {
      title: t('withdrawals.endAt').toUpperCase(),
      dataIndex: 'endAt',
      width: 80,
      align: 'center',
      render: (val: string) => <TableCellText>{moment(val).format(dateFormat)}</TableCellText>,
    },
    {
      title: t('withdrawals.status').toUpperCase(),
      dataIndex: 'status',
      width: 60,
      align: 'center',
      render: (val: string) => <TableCellText>{val}</TableCellText>,
    },
  ];

  const availableClaimAmount = withdrawals.filter((withdrawal) => withdrawal.endAt < moment().format()).length;
  const headerTitle = `${t('withdrawals.unlockedAsset', { count: availableClaimAmount || 0 })}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          {headerTitle}
        </Typography>
        {availableClaimAmount > 0 && <DoWithdraw />}
      </div>

      <Table columns={columns} dataSource={withdrawals} rowKey="idx" />
    </div>
  );
};
