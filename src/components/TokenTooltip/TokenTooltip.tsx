// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { BsBoxArrowInUpRight } from 'react-icons/bs';
import ExclamationCircleFilled from '@ant-design/icons/ExclamationCircleFilled';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { useSQToken } from '@containers';
import { Typography } from '@subql/components';
import { formatEther, TOKEN } from '@utils';
import { formatNumberWithLocale } from '@utils';
import { Button, Tooltip } from 'antd';

import { BRIDGE_URL } from 'src/const/bridge';

import styles from './index.module.less';

interface IProps {
  children?: React.ReactNode;
}

const TokenTooltip: FC<IProps> = (props) => {
  const { ethSqtBalance } = useSQToken();
  if (ethSqtBalance.result.loading) return null;
  if (ethSqtBalance.result.error) return null;
  if (ethSqtBalance.result.data?.isZero()) return null;
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
            Eth Wallet Balance: {formatNumberWithLocale(formatEther(ethSqtBalance.result.data, 4))} {TOKEN}
          </Typography>
          <Typography variant="small" type="secondary" style={{ paddingInlineStart: 22 }}>
            Your SQT needs to be on Base in order to be used on the SubQuery Network. To move SQT from the Ethereum to
            Base, you’ll need to bridge them across.
          </Typography>

          <a
            href={BRIDGE_URL}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4, textDecoration: 'none' }}
          >
            <Button
              type="primary"
              shape="round"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              Bridge Tokens
              <BsBoxArrowInUpRight />
            </Button>
          </a>
        </div>
      }
    >
      {props.children ? props.children : <InfoCircleOutlined style={{ color: 'var(--sq-info)', fontSize: 16 }} />}
    </Tooltip>
  );
};
export default TokenTooltip;
