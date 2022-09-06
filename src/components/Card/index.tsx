// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import styles from './Card.module.css';
import clsx from 'clsx';

interface CardProps {
  category?: string;
  title?: string;
  value?: string;
}

export const Card: React.VFC<CardProps> = ({ category, title, value }) => {
  return (
    <div className={styles.card}>
      {category && (
        <Typography variant="small" className={styles.category}>
          {category.toUpperCase()}
        </Typography>
      )}
      {title && (
        <Typography variant="medium" className={clsx(styles.title, category && styles.titleWithCategory)}>
          {title.toUpperCase()}
        </Typography>
      )}
      {value && (
        <Typography variant="h4" className={styles.value}>
          {value}
        </Typography>
      )}
    </div>
  );
};
