// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/components';

import styles from './SummaryList.module.css';

interface List {
  label: string;
  value: string | React.ReactNode | any;
}

interface SummaryListProps {
  title?: string;
  list: List[];
}

export const SummaryList: React.FC<SummaryListProps> = ({ title, list }) => {
  return (
    <div className={styles.container}>
      {title && <Typography>{title}</Typography>}
      <div className={styles.list}>
        {list.map((list) => (
          <div className={styles.listItem} key={list.label}>
            <Typography className={styles.label}>{list.label}</Typography>
            {typeof list.value === 'string' ? (
              <Typography className={styles.value}>{list.value}</Typography>
            ) : (
              <div className={styles.indexer}>{list.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
