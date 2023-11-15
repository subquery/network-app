// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Typography } from '@subql/components';
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
    desc: 'Connect with Metamask browser extension',
  },
  {
    icon: '/static/walletConnect.svg',
    name: 'WalletConnect',
    desc: 'Connect with WalletConnect browser extension',
  },
  {
    icon: '/static/talisman.png',
    name: 'Talisman',
    desc: 'Connect with Talisman browser extension',
  },
  {
    icon: '/static/rainbow.svg',
    name: 'Rainbow',
    desc: 'Connect with Rainbow browser extension',
  },
];

const Wallet: React.FC<{ description?: string; name: string; icon: string; onClick?: () => void }> = ({
  icon,
  name,
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
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={icon} alt="wallet logo" style={{ width: 36, height: 36, marginRight: 10 }} />
            <Typography variant="h4" style={{ color: '#000' }}>
              {name}
            </Typography>
          </div>
          <Typography variant="text" className={styles.walletSubtitle}>
            {description ?? t('connectWallet.metamaskDesc')}
          </Typography>
          <i className={['bi-arrow-right', styles.arrow].join(' ')} role="img" aria-label="arrow right" />
        </div>
      }
    />
  );
};

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
        const { icon, name, desc } = supportConnector;
        return (
          <ConnectButton.Custom key={name}>
            {({ openConnectModal }) => {
              return (
                <Wallet
                  icon={icon}
                  name={name}
                  description={desc}
                  onClick={() => {
                    openConnectModal();
                  }}
                ></Wallet>
              );
            }}
          </ConnectButton.Custom>
        );
      })}
    </div>
  );
};
