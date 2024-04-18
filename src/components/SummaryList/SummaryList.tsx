// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BsExclamationCircle } from 'react-icons/bs';
import { Typography } from '@subql/components';
import { Tooltip } from 'antd';
import { clsx } from 'clsx';

import styles from './SummaryList.module.css';

interface List {
  label: React.ReactNode;
  value: React.ReactNode;
  strong?: boolean;
  tooltip?: React.ReactNode;
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
        {list.map((listItem, index) => (
          <div className={styles.listItem} key={index}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Typography
                variant={listItem.strong ? 'text' : 'medium'}
                className={clsx(styles.label, listItem.strong ? styles.strongLabel : '')}
              >
                {listItem.label}
              </Typography>

              {listItem.tooltip && (
                <Tooltip title={listItem.tooltip}>
                  <BsExclamationCircle style={{ marginLeft: '8px', color: 'var(--sq-gray500)' }}></BsExclamationCircle>
                </Tooltip>
              )}
            </div>
            {typeof listItem.value === 'string' ? (
              <Typography className={styles.value}>{listItem.value}</Typography>
            ) : (
              <div className={styles.indexer}>{listItem.value}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
