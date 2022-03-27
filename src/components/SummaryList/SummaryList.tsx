// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import styles from './SummaryList.module.css';

interface List {
  label: string;
  val: string;
}

interface SummaryListProps {
  title?: string;
  list: List[];
}

export const SummaryList: React.VFC<SummaryListProps> = ({ title, list }) => {
  return (
    <div className={styles.container}>
      <Typography>{title ?? 'Summary'}</Typography>
      <div className={styles.list}>
        {list.map((list) => (
          <div className={styles.listItem}>
            <Typography className={styles.label}>{list.label}</Typography>
            <Typography>{list.val}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
};
