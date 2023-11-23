// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { Typography } from '@subql/components';
import { Tooltip } from 'antd';
import { TextProps } from 'antd/lib/typography/Text';
import clsx from 'clsx';

import { COLORS } from '../../utils';
import styles from './Typography.module.css';

/**
 * Text with tooltip option
 */

interface Props extends Omit<TextProps, 'content'> {
  content?: React.ReactNode;
  className?: string;
  tooltip?: string;
  tooltipColor?: string;
  tooltipSize?: number;
  tooltipDirection?: 'top' | 'left' | 'right' | 'bottom';
  children?: string | number | React.ReactNode;
  noTooltipIcon?: boolean;
}

export const AppTypography: React.FC<Props> = ({
  content,
  children,
  className,
  tooltip,
  tooltipSize,
  tooltipDirection = 'top',
  tooltipColor,
  noTooltipIcon,
  ...typographyProps
}) => {
  const rawContent = content === undefined ? children : content;
  const sortedContent = ['string', 'number'].includes(typeof rawContent) ? (
    <Typography className={clsx(styles.text, className)} {...typographyProps} weight={500}>
      {rawContent}
    </Typography>
  ) : (
    <>{rawContent}</>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement={tooltipDirection}>
        <div className={clsx(styles.tooltip)}>
          <div className={clsx(styles.tooltipContent)}>
            {sortedContent}
            {!noTooltipIcon && tooltip && (
              <AiOutlineQuestionCircle
                color={tooltipColor ?? COLORS.gray400}
                size={tooltipSize ?? 14}
                className={styles.tooltipIcon}
              />
            )}
          </div>
        </div>
      </Tooltip>
    );
  }

  return sortedContent;
};
