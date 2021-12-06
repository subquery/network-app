// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Copy.module.css';

type Props = {
  value?: string;
  className?: string;
};

const Copy: React.FC<Props> = ({ value, className }) => {
  const [icon, setIcon] = React.useState<boolean>(false);

  const handleClick = () => {
    setIcon(true);
    if (value) {
      navigator.clipboard.writeText(value);
    }
    setTimeout(() => setIcon(false), 500);
  };

  return (
    <div className={[styles.container, className].join(' ')} onClick={handleClick}>
      <i
        className={[icon ? 'bi-clipboard-check' : 'bi-clipboard', styles.copy].join(' ')}
        role="img"
        aria-label="copy"
      />
    </div>
  );
};

export default Copy;
