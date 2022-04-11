// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import * as React from 'react';
import styles from './TableText.module.css';

/**
 * Custom style of table cell content using antD.
 * Apply for tables of staking dashboard / plan manager..
 */

interface TableTextprops {
  text?: string | number;
  className?: string;
}

export const TableText: React.FC<TableTextprops> = ({ text, className }) => {
  return (
    <Typography variant="medium" className={[styles.text, className].join(' ')}>
      {text}
    </Typography>
  );
};
