// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Typography.module.css';
import { Tooltip, Typography as AntdTypography } from 'antd';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { COLORS } from '../../utils';
import clsx from 'clsx';
import { TextProps } from 'antd/lib/typography/Text';

/**
 * Text with tooltip option
 */

interface Props extends TextProps {
  content?: string | number | React.ReactNode;
  className?: string;
  tooltip?: string;
  tooltipColor?: string;
  tooltipSize?: number;
  children?: string | number | React.ReactNode;
  noTooltipIcon?: boolean;
}

export const AppTypography: React.FC<Props> = ({
  content,
  children,
  className,
  tooltip,
  tooltipSize,
  tooltipColor,
  noTooltipIcon,
  ...typographyProps
}) => {
  const rawContent = content === undefined ? children : content;
  const sortedContent = ['string', 'number'].includes(typeof rawContent) ? (
    <AntdTypography.Text className={clsx(styles.text, className)} {...typographyProps}>
      {rawContent}
    </AntdTypography.Text>
  ) : (
    <>{rawContent}</>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
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
