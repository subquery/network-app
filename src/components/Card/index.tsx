// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Card as SQCard } from '@subql/components';
import clsx from 'clsx';

import styles from './Card.module.css';

interface CardProps {
  category?: string;
  title?: string;
  value?: string;
  className?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ category, title, value, className, action }) => {
  return (
    <div className={styles.cardContainer}>
      <SQCard
        title={title}
        description={value}
        customDropdown={action}
        className={clsx(className, styles.sCard)}
      ></SQCard>
    </div>
  );
};
