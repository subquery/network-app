// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Table.module.css';

type TableProps = {
  className?: string;
};

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={styles.tableContainer}>
      <table className={[styles.table, className].join(' ')}>{children}</table>
    </div>
  );
};

type TableHeadProps = {
  className?: string;
};

export const TableHead: React.FC<TableHeadProps> = ({ className, children }) => {
  return <thead className={[styles.head, className].join(' ')}>{children}</thead>;
};

type TableBodyProps = {
  className?: string;
};

export const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return <tbody className={[styles.body, className].join(' ')}>{children}</tbody>;
};

type TableRowProps = {
  className?: string;
};

export const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return <tr className={[styles.row, className].join(' ')}>{children}</tr>;
};

type TableCellProps = {
  className?: string;
};

export const TableCell: React.FC<TableCellProps> = ({ children, className }) => {
  return <th className={[styles.cell, className].join(' ')}>{children}</th>;
};

export default Table;
