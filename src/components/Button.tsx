// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Button.module.css';

type Props = {
  type?: 'primary' | 'secondary';
  label: string;
  onClick?: () => void;
};

const Button: React.VFC<Props> = (props) => {
  return (
    <button
      type="button"
      className={[styles.button, props.type && styles[props.type]].join(' ')}
      onClick={props.onClick}
    >
      {props.label}
    </button>
  );
};

export default Button;
