// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppTypography } from '@components/Typography';
import { getConnectorConfig } from '@utils/getNetworkConnector';
import { UnsupportedChainIdError } from '@web3-react/core';
import { Button } from 'antd';

import { useWeb3Store } from 'src/stores';

import { ECOSYSTEM_NETWORK, handleSwitchNetwork, useWeb3 } from '../../containers/Web3';
import styles from './ChainStatus.module.css';

export const ChainStatus: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { ethWindowObj } = useWeb3Store();
  const { error, connector } = useWeb3();
  const { t } = useTranslation('translation');
  const connectorWindowObj = getConnectorConfig(connector).windowObj;

  const isExtensionInstalled = React.useMemo(
    () => !!connectorWindowObj?.isMetaMask || !!connectorWindowObj?.isTalisman,
    [connectorWindowObj?.isMetaMask, connectorWindowObj?.isTalisman],
  );

  if (error instanceof UnsupportedChainIdError) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <AppTypography className={styles.title}>{t('unsupportedNetwork.title')}</AppTypography>
          <div className={styles.switchContainer}>
            <AppTypography className={styles.description}>
              {t('unsupportedNetwork.subtitle', { supportNetwork: ECOSYSTEM_NETWORK })}
            </AppTypography>
            {isExtensionInstalled && (
              <Button onClick={() => handleSwitchNetwork(ethWindowObj)} type="primary" size="large" shape="round">
                {t('unsupportedNetwork.button')}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
