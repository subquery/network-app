// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import styles from './Table.module.css';

/**
 * NOTE:
 * FROM April 2022, use antD table
 */

type TableProps = {
  className?: string;
};

export const Table: React.FC<React.PropsWithChildren<TableProps>> = ({ children, className }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={[styles.table, className].join(' ')}>{children}</table>
    </div>
  );
};

type TableHeadProps = {
  className?: string;
};

export const TableHead: React.FC<React.PropsWithChildren<TableHeadProps>> = ({ className, children }) => {
  return <thead className={[styles.head, className].join(' ')}>{children}</thead>;
};

type TableBodyProps = {
  className?: string;
};

export const TableBody: React.FC<React.PropsWithChildren<TableBodyProps>> = ({ children, className }) => {
  return <tbody className={[styles.body, className].join(' ')}>{children}</tbody>;
};

type TableRowProps = {
  className?: string;
};

export const TableRow: React.FC<React.PropsWithChildren<TableRowProps>> = ({ children, className }) => {
  return <tr className={[styles.row, className].join(' ')}>{children}</tr>;
};

type TableCellProps = {
  className?: string;
};

export const TableCell: React.FC<React.PropsWithChildren<TableCellProps>> = ({ children, className }) => {
  return <th className={[styles.cell, className].join(' ')}>{children}</th>;
};

export default Table;
