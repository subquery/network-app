// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Details.module.css';

type Props = {
  label: string;
  value?: string;
  href?: string;
  className?: string;
};

const Detail: React.FC<Props> = ({ label, value, href, className, children }) => {
  const renderValue = () => {
    if (href) {
      return (
        <a href={href} className={styles.value} target="_blank" rel="noreferrer">
          {value ?? '-'}
        </a>
      );
    }

    if (value) {
      return <span className={styles.value}>{value}</span>;
    }

    return children;
  };

  return (
    <div className={[styles.detail, className].join(' ')}>
      <span className="label">{label}</span>
      {renderValue()}
    </div>
  );
};

export default Detail;
