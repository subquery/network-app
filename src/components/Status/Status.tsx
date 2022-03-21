// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Status.module.css';

export enum StatusColor {
  red = 'red',
  green = 'green',
  gray = 'gray',
  blue = 'blue',
}

type Props = {
  text: string;
  color?: StatusColor;
};

const Status: React.FC<Props> = ({ text, color = 'gray' }) => {
  return (
    <div className={[styles.container, styles[`container-${color}`]].join(' ')}>
      <p className={[styles.text, styles[`text-${color}`]].join(' ')}>{text}</p>
    </div>
  );
};

export default Status;
