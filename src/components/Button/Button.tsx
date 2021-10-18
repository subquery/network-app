// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Button.module.css';

type Props = {
  type?: 'primary' | 'secondary';
  label: string;
  leftItem?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button: React.VFC<Props> = ({ type, className, leftItem, label, onClick, disabled, ...rest }) => {
  return (
    <a
      className={[styles.button, type && styles[type], disabled && styles.disabled, className].join(' ')}
      onClick={disabled ? undefined : onClick}
      {...rest}
    >
      {leftItem}
      <span>{label}</span>
    </a>
  );
};

export default Button;
