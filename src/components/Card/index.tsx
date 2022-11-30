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
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.VFC<CardProps> = ({ category, title, value, className, action }) => {
  return (
    <div className={styles.cardContainer}>
      <div className={clsx(styles.card, className)}>
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
          <Typography variant="h5" className={styles.value}>
            {value}
          </Typography>
        )}
      </div>
      {action && <>{action}</>}
    </div>
  );
};
