// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import styles from './Card.module.css';
import clsx from 'clsx';
import { Card as SQCard } from '@subql/components';

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
      <SQCard title={title} description={value} customDropdown={action} className={className}></SQCard>
    </div>
  );
};
