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
};

const Button: React.VFC<Props> = (props) => {
  return (
    <a
      // type="button"
      className={[styles.button, props.type && styles[props.type], props.className].join(' ')}
      onClick={props.onClick}
      href={props.href}
    >
      {props.leftItem}
      <span>{props.label}</span>
    </a>
  );
};

export default Button;
