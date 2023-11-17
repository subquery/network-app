// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { Typography } from '@subql/components';

import styles from './index.module.less';

interface IProps {
  size?: 'normal' | 'small';
  tryAgain?: () => void;
}

const RpcError: FC<IProps> = (props) => {
  const { size = 'normal', tryAgain } = props;

  return (
    <div className={styles.rpcError}>
      <img
        src="/static/rpcError.svg"
        alt="rpc"
        style={{
          width: 96,
          height: 74,
        }}
      ></img>
      <Typography variant={size === 'small' ? 'h6' : 'h5'} weight={500}>
        Oops! RPC Service Unavailable
      </Typography>
      <Typography type="secondary" style={{ textAlign: 'center' }}>
        It looks like the RPC service is temporarily unavaiable
        {tryAgain ? (
          <>
            <span>, please</span>
            <br></br>
            <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => tryAgain()}>
              try again
            </span>
            <span> or let us know in </span>
            <a href="https://discord.com/invite/subquery">
              <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--sq-gray600)' }}>
                Discord.
              </span>
            </a>
          </>
        ) : (
          ''
        )}
      </Typography>
    </div>
  );
};
export default RpcError;
