// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';

import { AppTypography } from '..';
import styles from './TableText.module.css';

/**
 * Custom style of table text content using antD.
 * Apply for tables of staking dashboard / plan manager..
 */

interface TableTextprops {
  content?: string | number | React.ReactNode;
  className?: string;
  tooltip?: string;
  children?: string | number | React.ReactNode;
}

export const TableText: React.FC<TableTextprops> = (props) => {
  return <AppTypography {...props} className={styles.text} noTooltipIcon />;
};
