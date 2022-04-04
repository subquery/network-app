// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { BigNumber } from 'ethers';
import { useTranslation } from 'react-i18next';
import { formatEther } from '../../../../utils';
import { GetWithdrawls_withdrawls_nodes as Withdrawls } from '../../../../__generated__/GetWithdrawls';
import styles from './LockedList.module.css';
import { DoWithdraw } from '../DoWithdraw';

//TODO: status: locked, unlock(available to claim)

const TableCellText = ({ children }: { children: React.ReactChild | React.ReactChildren }) => (
  <TableCell>
    <Typography className={styles.tableCell} variant="medium">
      {children}
    </Typography>
  </TableCell>
);

interface props {
  withdrawals: Withdrawls[];
}

export const LockedList: React.VFC<props> = ({ withdrawals }) => {
  const { t } = useTranslation();
  // const lockPeriod = useLockPeriod();

  const sortedWithdrawals = withdrawals.map((withdrawal) => {
    const sortedAmount = formatEther(BigNumber.from(withdrawal.amount));
    const status = withdrawal.claimed ? t('withdrawals.claimed') : t('withdrawals.unClaim');
    const startAt = new Date(withdrawal.startTime).toLocaleString();
    return { amount: sortedAmount, status, startAt };
  });

  const tableHeaders = [
    '#',
    t('withdrawals.amount').toUpperCase(),
    t('withdrawals.start').toUpperCase(),
    t('withdrawals.status').toUpperCase(),
  ];

  const headerTitle = `${t('withdrawals.unlockedAsset', { count: withdrawals.length || 0 })}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h6" className={styles.title}>
          {headerTitle}
        </Typography>
        <DoWithdraw />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            {tableHeaders.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedWithdrawals.map((withdrawals, idx) => (
            <TableRow key={idx}>
              <TableCellText>{idx + 1}</TableCellText>
              <TableCellText>{withdrawals.amount}</TableCellText>
              <TableCellText>{withdrawals.startAt}</TableCellText>
              <TableCellText>{withdrawals.status}</TableCellText>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
