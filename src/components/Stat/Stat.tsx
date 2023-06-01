// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { AppTypography } from '../Typography';
import styles from './Stat.module.css';

interface CardProps {
  title?: string;
  tooltip?: string;
  value?: string;
}

export const Stat: React.FC<CardProps> = ({ title, tooltip, value }) => {
  return (
    <div className={styles.stat}>
      {title && (
        <AppTypography tooltip={tooltip} type="secondary" className={styles.title}>
          {title.toUpperCase()}
        </AppTypography>
      )}
      {value && <AppTypography className={styles.value}>{value}</AppTypography>}
    </div>
  );
};
