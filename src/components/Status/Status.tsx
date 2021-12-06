// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Status.module.css';

type Props = {
  text: string;
  color?: 'red' | 'green' | 'gray';
};

const Status: React.FC<Props> = ({ text, color = 'gray' }) => {
  return (
    <div className={[styles.container, styles[`container-${color}`]].join(' ')}>
      <p className={[styles.text, styles[`text-${color}`]].join(' ')}>{text}</p>
    </div>
  );
};

export default Status;
