// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@subql/react-ui';
import { Dropdown, Menu, Button as AntdButton } from 'antd';
import { useWeb3 } from '../../containers';
import { ALL_SUPPORTED_CONNECTORS, SUPPORTED_CONNECTORS_TYPE } from '../../containers/Web3';
import { AppTypography } from '../Typography';
import styles from './ConnectWalletButton.module.css';

const getMenu = (menuItems: Array<{ label: string; onClick: () => void }>) => {
  return (
    <Menu
      items={menuItems.map((item) => ({
        key: item.label,
        label: (
          <AntdButton type="text" onClick={item.onClick} block>
            <AppTypography className={styles.menuItem}>{item.label}</AppTypography>
          </AntdButton>
        ),
      }))}
    />
  );
};

export const ConnectWalletButton: React.VFC = () => {
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

  const menuItems = ALL_SUPPORTED_CONNECTORS.map((connector) => ({
    label: connector.title ?? '',
    onClick: () => onNetworkConnect(connector.connector),
  }));

  return (
    <Dropdown overlay={getMenu(menuItems)}>
      <Button
        type="secondary"
        label={t('header.connectWallet')}
        leftItem={<i className={`bi-link-45deg`} role="img" aria-label="link" />}
      />
    </Dropdown>
  );
};
