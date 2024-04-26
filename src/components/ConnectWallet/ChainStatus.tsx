// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { Typography } from '@subql/components';
import { Button } from 'antd';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';

import { tipsChainIds, tipsL1ChainIds } from 'src/config/rainbowConf';

import { ECOSYSTEM_NETWORK, SUPPORTED_NETWORK } from '../../containers/Web3';
import styles from './ChainStatus.module.css';

export const ChainStatus: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { isConnected } = useAccount();
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { t } = useTranslation();
  const location = useLocation();

  const tipUnSupportedNetwork = React.useMemo(() => {
    if (location.pathname === '/bridge' || location.pathname === '/bridge/success') {
      return isConnected && !tipsL1ChainIds.includes(chain?.id || 0);
    }
    return isConnected && !tipsChainIds.includes(chain?.id || 0);
  }, [isConnected, chain?.id, location.pathname]);

  const switchNetworkChainId = React.useMemo(() => {
    if (location.pathname === '/bridge' || location.pathname === '/bridge/success') {
      return tipsL1ChainIds[0];
    }
    return tipsChainIds[0];
  }, [location.pathname]);

  const tipName = React.useMemo(() => {
    if (location.pathname === '/bridge' || location.pathname === '/bridge/success') {
      return SUPPORTED_NETWORK === 'mainnet' ? 'Ethereum' : 'Sepolia';
    }

    return ECOSYSTEM_NETWORK;
  }, [location.pathname]);

  if (isConnected && tipUnSupportedNetwork) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.switchContainer}>
            <img src="/static/switch-network.png" alt="" width="80" height="80" />
            <Typography variant="h4">Switch to {tipName} network</Typography>
            <Typography style={{ textAlign: 'center' }}>
              You need to be connected to the {tipName} network to perform this action
            </Typography>
            <Button
              style={{ width: '100%' }}
              onClick={() => {
                switchNetwork?.(switchNetworkChainId);
              }}
              type="primary"
              size="large"
              shape="round"
            >
              {t('unsupportedNetwork.button')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
