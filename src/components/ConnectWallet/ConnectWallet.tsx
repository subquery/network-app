// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/react-ui';
import styles from './ConnectWallet.module.css';

type Props = {
  title?: string;
  subTitle?: string;
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
            <img src={icon} alt="wallet logo" className={styles.walletIcon} />

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

const ConnectWallet: React.VFC<Props> = ({ title, subTitle, onConnect }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Typography variant="h4">{title || t('connectWallet.title')}</Typography>
      <Typography variant="body" className={styles.subtitle2}>
        {t('connectWallet.subtitle')}
      </Typography>
      <Wallet name="Metamask" icon="/static/metamask.png" onClick={onConnect} />
    </div>
  );
};

export default ConnectWallet;
