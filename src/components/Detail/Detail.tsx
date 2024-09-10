// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/components';
import { truncateDeploymentId } from '@utils';
import { Tooltip } from 'antd';
import { isString } from 'lodash-es';

import Copy from '../Copy';
import styles from './Details.module.css';

type Props = {
  label: string;
  value?: React.ReactNode;
  href?: string;
  className?: string;
  canCopy?: boolean;
  children?: React.ReactNode;
  isTruncate?: boolean;
  capitalize?: boolean;
};

const Detail: React.FC<Props> = ({
  label,
  value,
  href,
  className,
  canCopy,
  children,
  capitalize = false,
  isTruncate,
}) => {
  const renderValue = () => {
    if (href) {
      return (
        <a href={href} className={styles.value} target="_blank" rel="noreferrer">
          {value ?? '-'}
        </a>
      );
    }

    if (!isString(value)) {
      return value;
    }

    if (value) {
      return (
        <Tooltip title={isTruncate ? value : ''}>
          <Typography className={styles.value} variant="medium">
            {isTruncate ? truncateDeploymentId(value) : value}
          </Typography>
        </Tooltip>
      );
    }

    return children;
  };

  return (
    <div className={[styles.detail, className].join(' ')}>
      <Typography type="secondary" variant="medium">
        {label}
      </Typography>
      <div
        className={styles.valueCont}
        style={{
          textTransform: capitalize ? 'capitalize' : 'none',
        }}
      >
        {renderValue()}
        {canCopy && isString(value) && <Copy value={href ?? value} className={styles.copy} />}
      </div>
    </div>
  );
};

export default Detail;
