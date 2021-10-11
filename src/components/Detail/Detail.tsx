// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Details.module.css';

type Props = {
  label: string;
  value: string;
  href?: string;
  className?: string;
};

const Detail: React.VFC<Props> = ({ label, value, href, className }) => {
  return (
    <div className={[styles.detail, className].join(' ')}>
      <span className={styles.label}>{label}</span>
      {href ? (
        <a href={href} className={styles.value} target="_blank" rel="noreferrer">
          {value}
        </a>
      ) : (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
};

export default Detail;
