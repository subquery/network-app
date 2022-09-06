// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import styles from './Card.module.css';

interface CardProps {
  category?: string;
  title?: string;
  value?: string;
}

export const Card: React.VFC<CardProps> = ({ category, title, value }) => {
  return (
    <div className={styles.card}>
      {title && (
        <Typography variant="medium" className={styles.title}>
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
