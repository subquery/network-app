// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
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
