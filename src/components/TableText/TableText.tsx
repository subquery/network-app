// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Typography } from '@subql/react-ui';
import * as React from 'react';
import styles from './TableText.module.css';
import { Tooltip, Typography } from 'antd';

/**
 * Custom style of table cell content using antD.
 * Apply for tables of staking dashboard / plan manager..
 */

interface TableTextprops {
  content?: string | number | React.ReactNode;
  className?: string;
  tooltip?: string;
}

export const TableText: React.FC<TableTextprops> = ({ content, className, tooltip }) => {
  return (
    <Typography.Text className={[styles.text, className].join(' ')}>
      {tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content}
    </Typography.Text>
  );
};
