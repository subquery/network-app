// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Typography } from '@subql/components';
import { Button } from 'antd';
import clsx from 'clsx';

import styles from './ConnectWallet.module.less';

type Props = {
  title?: string;
  subTitle?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const ConnectWallet: React.FC<Props> = ({ title, subTitle, className, style }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.container, className)} style={style}>
      <img
        src="/static/connectWallet.png"
        alt="connect wallet"
        width="238"
        height="238"
        style={{ objectFit: 'contain' }}
      ></img>
      <Typography variant="h4" className={styles.title} weight={600}>
        {title || t('connectWallet.title')}
      </Typography>
      <Typography variant="text" className={styles.subtitle}>
        {subTitle || t('connectWallet.subtitle')}
      </Typography>

      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <Button
            shape="round"
            size="large"
            onClick={() => openConnectModal()}
            type="primary"
            style={{ width: '100%', background: 'var(--sq-blue600)' }}
            className={styles.connectBtn}
          >
            Connect Wallet
          </Button>
        )}
      </ConnectButton.Custom>
    </div>
  );
};
