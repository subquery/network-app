// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Copy.module.css';

type Props = {
  value?: string;
  className?: string;
  iconClassName?: string;
};

const Copy: React.FC<Props> = ({ value, className, iconClassName }) => {
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
        className={[icon ? 'bi-clipboard-check' : 'bi-clipboard', styles.copy, iconClassName].join(' ')}
        role="img"
        aria-label="copy"
      />
    </div>
  );
};

export default Copy;
