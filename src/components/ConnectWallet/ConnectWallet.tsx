// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/components';

import { ALL_SUPPORTED_CONNECTORS, useConnectNetwork } from '../../containers/Web3';
import styles from './ConnectWallet.module.css';

type Props = {
  title?: string;
  subTitle?: string;
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
          <div>
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

export const ConnectWallet: React.FC<Props> = ({ title, subTitle }) => {
  const { t } = useTranslation();
  const { onNetworkConnect } = useConnectNetwork();

  return (
    <div className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        {title || t('connectWallet.title')}
      </Typography>
      <Typography variant="text" className={styles.subtitle}>
        {subTitle || t('connectWallet.subtitle')}
      </Typography>
      {ALL_SUPPORTED_CONNECTORS.map((supportConnector) => {
        const { description, icon } = supportConnector;
        return (
          <Wallet
            key={description}
            description={description}
            icon={icon ?? '/static/metamask.png'}
            onClick={() => onNetworkConnect(supportConnector)}
          />
        );
      })}
    </div>
  );
};
