// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import styles from './MyFlexPlans.module.css';
import { Dropdown, Menu } from 'antd';
import { CryptoExchangeModal } from '../../../components/CryptoExchangeModal';

export const BillingAction: React.VFC = () => {
  const menuList = (
    <Menu>
      <Menu.Item key={'Transfer'}>
        <CryptoExchangeModal action="Transfer" />
      </Menu.Item>
      <Menu.Item key={'Withdraw'}>
        <CryptoExchangeModal action="Withdraw" />
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menuList} trigger={['click']}>
      <a onClick={(e) => e.preventDefault()} href="/" className={styles.billingAction}>
        <MoreOutlined />
      </a>
    </Dropdown>
  );
};
