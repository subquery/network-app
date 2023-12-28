// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { ExclamationCircleFilled, InfoCircleOutlined } from '@ant-design/icons';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { Button, Tooltip } from 'antd';

import styles from './index.module.less';

interface IProps {
  children?: React.ReactNode;
}

const TokenTooltip: FC<IProps> = (props) => {
  return (
    <Tooltip
      overlayClassName={styles.tokenTooltip}
      color="#fff"
      title={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExclamationCircleFilled style={{ color: 'var(--sq-warning)', marginRight: 8 }} />
            <Typography>You have {TOKEN} on Ethereum</Typography>
          </div>
          <Typography variant="small" type="secondary" style={{ paddingInlineStart: 22 }}>
            Eth Wallet Balance: {TOKEN}
          </Typography>
          <Typography variant="small" type="secondary" style={{ paddingInlineStart: 22 }}>
            Your SQT needs to be on Polygon in order to be used on the SubQuery Network. To move SQT from the Ethereum
            to Polygon, you’ll need to bridge them across.
          </Typography>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <Button type="primary" shape="round">
              Bridge Token
            </Button>
          </div>
        </div>
      }
    >
      {props.children ? props.children : <InfoCircleOutlined style={{ color: 'var(--sq-info)', fontSize: 16 }} />}
    </Tooltip>
  );
};
export default TokenTooltip;
