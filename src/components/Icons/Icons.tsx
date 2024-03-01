// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { HTMLAttributes } from 'react';
import { AiOutlineEllipsis } from 'react-icons/ai';
import { clsx } from 'clsx';

import styles from './Icons.module.less';

export const OutlineDot = (props: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div {...props} className={clsx(styles.actionWrapper, props?.className)}>
      <AiOutlineEllipsis></AiOutlineEllipsis>
    </div>
  );
};
