// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/components';

import Copy from '../Copy';
import styles from './Details.module.css';

type Props = {
  label: string;
  value?: string;
  href?: string;
  className?: string;
  canCopy?: boolean;
  children?: React.ReactNode;
};

const Detail: React.FC<Props> = ({ label, value, href, className, canCopy, children }) => {
  const renderValue = () => {
    if (href) {
      return (
        <a href={href} className={styles.value} target="_blank" rel="noreferrer">
          {value ?? '-'}
        </a>
      );
    }

    if (value) {
      return (
        <Typography className={styles.value} variant="medium">
          {value}
        </Typography>
      );
    }

    return children;
  };

  return (
    <div className={[styles.detail, className].join(' ')}>
      <Typography type="secondary" variant="medium">
        {label}
      </Typography>
      <div className={styles.valueCont}>
        {renderValue()}
        {canCopy && <Copy value={href ?? value} className={styles.copy} />}
      </div>
    </div>
  );
};

export default Detail;
