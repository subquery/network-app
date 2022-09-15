// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Typography } from '@subql/react-ui';
import styles from './ConnectWallet.module.css';
import { useWeb3 } from '../../containers';
import { ALL_SUPPORTED_CONNECTORS, SUPPORTED_CONNECTORS_TYPE } from '../../containers/Web3';

type Props = {
  title?: string;
  subTitle?: string;
};

const Wallet: React.VFC<{ description?: string; icon: string; onClick?: () => void }> = ({
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

            <Typography variant="body" className={styles.walletSubtitle}>
              {description ?? t('connectWallet.metamaskDesc')}
            </Typography>
          </div>
          <i className={['bi-arrow-right', styles.arrow].join(' ')} role="img" aria-label="arrow right" />
        </div>
      }
    />
  );
};

export const ConnectWallet: React.VFC<Props> = ({ title, subTitle }) => {
  const { account, activate, deactivate } = useWeb3();
  const { t } = useTranslation();
  const onNetworkConnect = React.useCallback(
    async (connector: SUPPORTED_CONNECTORS_TYPE) => {
      if (account) {
        deactivate();
        return;
      }

      try {
        await activate(connector);
      } catch (e) {
        console.log('Failed to activate wallet', e);
      }
    },
    [account, deactivate, activate],
  );

  return (
    <div className={styles.container}>
      <Typography variant="h4" className={styles.title}>
        {title || t('connectWallet.title')}
      </Typography>
      <Typography variant="body" className={styles.subtitle}>
        {subTitle || t('connectWallet.subtitle')}
      </Typography>
      {ALL_SUPPORTED_CONNECTORS.map((supportConnector) => {
        const { description, icon, connector } = supportConnector;
        return (
          <Wallet
            key={description}
            description={description}
            icon={icon ?? '/static/metamask.png'}
            onClick={() => onNetworkConnect(connector)}
          />
        );
      })}
    </div>
  );
};
