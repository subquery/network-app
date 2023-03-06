// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@subql/react-ui';
import { Dropdown, Menu, Button as AntdButton } from 'antd';
import { ALL_SUPPORTED_CONNECTORS, useConnectNetwork } from '../../containers/Web3';
import { AppTypography } from '../Typography';
import styles from './ConnectWalletButton.module.css';

export const ConnectWalletButton: React.FC = () => {
  const { onNetworkConnect } = useConnectNetwork();

  const { t } = useTranslation();

  const menuItems = ALL_SUPPORTED_CONNECTORS.map((connector) => ({
    label: connector.title ?? '',
    onClick: () => onNetworkConnect(connector),
  }));

  const menu = (
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

  return (
    <Dropdown overlay={menu}>
      <Button
        type="secondary"
        label={t('header.connectWallet')}
        leftItem={<i className={`bi-link-45deg`} role="img" aria-label="link" />}
      />
    </Dropdown>
  );
};
