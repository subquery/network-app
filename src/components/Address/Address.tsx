// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { truncateAddress } from '../../utils';
import styles from './Address.module.css';

type Props = {
  address: string;
  size?: 'small' | 'large';
};

const Address: React.FC<Props> = ({ address, size = 'small' }) => {
  const iconSize = React.useMemo(() => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
      default:
        return 32;
    }
  }, [size]);

  return (
    <div className={styles.container}>
      <Jazzicon diameter={iconSize} seed={jsNumberForAddress(address)} />
      <p className={[styles.text, styles[size]].join(' ')}>{truncateAddress(address)}</p>
    </div>
  );
};

export default Address;
