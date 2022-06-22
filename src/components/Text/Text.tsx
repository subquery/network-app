// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import { Typography } from '@subql/react-ui';
import * as React from 'react';
import styles from './Text.module.css';
import { Tooltip, Typography } from 'antd';
import { AiOutlineExclamationCircle } from 'react-icons/ai';
import { COLORS } from '../../utils';
import clsx from 'clsx';

/**
 * Text with tooltip option
 */

interface TextProps {
  content?: string | number | React.ReactNode;
  className?: string;
  tooltip?: string;
  children?: string | number | React.ReactNode;
  noTooltipIcon?: boolean;
}

export const Text: React.FC<TextProps> = ({
  content,
  children,
  className,
  tooltip,
  noTooltipIcon,
  ...typographyProps
}) => {
  const rawContent = content === undefined ? children : content;
  const sortedContent = ['string', 'number'].includes(typeof rawContent) ? (
    <Typography.Text className={clsx(styles.text, className)} {...typographyProps}>
      {rawContent}
    </Typography.Text>
  ) : (
    <>{rawContent}</>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={`${noTooltipIcon ? 'top' : 'topLeft'}`}>
        <div className={clsx(styles.tooltip)}>
          {sortedContent}
          {!noTooltipIcon && tooltip && (
            <AiOutlineExclamationCircle color={COLORS.gray400} size={14} className={styles.tooltipIcon} />
          )}
        </div>
      </Tooltip>
    );
  }

  return <Typography.Text className={clsx(styles.text, className)}>{sortedContent}</Typography.Text>;
};
