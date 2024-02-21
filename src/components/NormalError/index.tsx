// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { Typography } from '@subql/components';
import { clsx } from 'clsx';

import styles from './index.module.less';

interface IProps {
  size?: 'normal' | 'small';
  children?: React.ReactNode;
  withWrapper?: boolean;
}

const NormalError: FC<IProps> = (props) => {
  const { size = 'normal', children, withWrapper = false } = props;

  return (
    <div className={clsx(styles.normalError, withWrapper ? styles.withWrapper : '')}>
      <img
        src="/static/rpcError.svg"
        alt="rpc"
        style={{
          width: 96,
          height: 74,
        }}
      ></img>
      <Typography variant={size === 'small' ? 'h6' : 'h5'} weight={500}>
        Oops! Something went wrong.
      </Typography>
      <Typography type="secondary" style={{ textAlign: 'center' }}>
        {children}
      </Typography>
    </div>
  );
};
export default NormalError;
