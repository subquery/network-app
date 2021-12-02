// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button } from '..';
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
              <p className={styles.walletTitle}>{name}</p>
            </div>
            <p className={styles.walletSubtitle}>{t('connectWallet.metamaskDesc')}</p>
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
      <p className={styles.title}>{t('connectWallet.title')}</p>
      <p className={styles.subtitle}>
        <Trans i18nKey="connectWallet.subtitle">
          Use the studio to create and manage your SubQuery projects.\nLearn how to create a SubQuery project{' '}
          <a href="/" target="_blank">
            here
          </a>
        </Trans>
      </p>
      <p className={styles.connectWith}>{t('connectWallet.connectWith')}</p>
      <Wallet name="Metamask" icon="/static/metamask.png" onClick={onConnect} />
    </div>
  );
};

export default ConnectWallet;
