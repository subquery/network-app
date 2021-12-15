// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/react-ui';
import styles from './ConnectWallet.module.css';

type Props = {
  onConnect?: () => void;
};

const Wallet: React.VFC<{ name: string; icon: string; onClick?: () => void }> = ({ name, icon, onClick }) => {
  const { t } = useTranslation();

  return (
    <Button
      type="secondary"
      label=""
      className={styles.walletContainer}
      onClick={onClick}
      leftItem={
        <div className={styles.wallet}>
          <div>
            <div className={styles.walletUpper}>
              <img src={icon} alt="wallet logo" className={styles.walletIcon} />
              <Typography variant="h5">{name}</Typography>
            </div>
            <Typography variant="body" className={styles.walletSubtitle}>
              {t('connectWallet.metamaskDesc')}
            </Typography>
          </div>
          <i className={['bi-arrow-right', styles.arrow].join(' ')} role="img" aria-label="arrow right" />
        </div>
      }
    />
  );
};

const ConnectWallet: React.VFC<Props> = ({ onConnect }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Typography variant="h4">{t('connectWallet.title')}</Typography>
      <Typography variant="body" className={styles.subtitle2}>
        <Trans i18nKey="connectWallet.subtitle">
          Use the studio to create and manage your SubQuery projects.\nLearn how to create a SubQuery project
          <a href="/" target="_blank">
            here
          </a>
        </Trans>
      </Typography>
      <Typography variant="h6" className={styles.connectWith}>
        {t('connectWallet.connectWith')}
      </Typography>
      <Wallet name="Metamask" icon="/static/metamask.png" onClick={onConnect} />
    </div>
  );
};

export default ConnectWallet;
