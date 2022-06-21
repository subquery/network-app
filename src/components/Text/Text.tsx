// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Typography } from '@subql/react-ui';
import * as React from 'react';
import styles from './Text.module.css';
import { Tooltip, Typography } from 'antd';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { COLORS } from '../../utils';

/**
 * Custom style of table cell content using antD.
 * Apply for tables of staking dashboard / plan manager..
 */

interface TextProps {
  content?: string | number | React.ReactNode;
  className?: string;
  tooltip?: string;
  children?: string | number | React.ReactNode;
}

export const Text: React.FC<TextProps> = ({ content, children, className, tooltip }) => {
  const sortedContent = content === undefined ? children : content;
  return (
    <Typography.Text className={[styles.text, className].join(' ')}>
      {tooltip ? (
        <Tooltip title={tooltip} placement="topLeft">
          <div className={styles.tooltip}>
            <div>{content || children}</div>
            <AiOutlineExclamationCircle color={COLORS.gray400} size={14} className={styles.tooltipIcon} />
          </div>
        </Tooltip>
      ) : (
        sortedContent
      )}
    </Typography.Text>
  );
};
