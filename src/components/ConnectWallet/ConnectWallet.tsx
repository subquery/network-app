// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Typography } from '@subql/components';
import clsx from 'clsx';

import styles from './ConnectWallet.module.less';

type Props = {
  title?: string;
  subTitle?: string;
  className?: string;
};

export const SUPPORTED_NETWORKS = [
  {
    icon: '/static/metaMask.svg',
    name: 'MetaMask',
  },
  {
    icon: '/static/walletConnect.svg',
    name: 'WalletConnect',
  },
  {
    icon: '/static/talisman.png',
    name: 'Talisman',
  },
  {
    icon: '/static/rainbow.svg',
    name: 'Rainbow',
  },
];

export const ConnectWallet: React.FC<Props> = ({ title, subTitle, className }) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.container, className)}>
      <Typography variant="h4" className={styles.title}>
        {title || t('connectWallet.title')}
      </Typography>
      <Typography variant="text" className={styles.subtitle}>
        {subTitle || t('connectWallet.subtitle')}
      </Typography>

      {SUPPORTED_NETWORKS.map((supportConnector) => {
        const { icon, name } = supportConnector;
        return (
          <ConnectButton.Custom key={name}>
            {({ openConnectModal }) => {
              return (
                <button
                  onClick={() => {
                    openConnectModal();
                  }}
                  className={styles.connectButton}
                >
                  <img src={icon} alt="" style={{ width: '24px', height: '24px' }}></img>
                  {name}
                </button>
              );
            }}
          </ConnectButton.Custom>
        );
      })}
    </div>
  );
};
