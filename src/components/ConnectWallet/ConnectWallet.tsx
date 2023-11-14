// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Typography } from '@subql/components';
import clsx from 'clsx';
import { useConnect } from 'wagmi';

import styles from './ConnectWallet.module.less';

type Props = {
  title?: string;
  subTitle?: string;
  className?: string;
};

const Wallet: React.FC<{ description?: string; icon: string; onClick?: () => void }> = ({
  icon,
  onClick,
  description,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      type="secondary"
      className={styles.walletContainer}
      onClick={onClick}
      leftItem={
        <div className={styles.wallet}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <img src={icon} alt="wallet logo" className={styles.walletIcon} />

            <Typography variant="text" className={styles.walletSubtitle}>
              {description ?? t('connectWallet.metamaskDesc')}
            </Typography>
          </div>
          <i className={['bi-arrow-right', styles.arrow].join(' ')} role="img" aria-label="arrow right" />
        </div>
      }
    />
  );
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
