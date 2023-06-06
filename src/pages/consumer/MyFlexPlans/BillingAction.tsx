// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

import { BillingExchangeModal } from '../../../components/BillingTransferModal';
import styles from './MyFlexPlans.module.css';

export const BillingAction: React.FC = () => {
  const menuList = (
    <Menu>
      <Menu.Item key={'Transfer'}>
        <BillingExchangeModal action="Transfer" />
      </Menu.Item>
      <Menu.Item key={'Withdraw'}>
        <BillingExchangeModal action="Withdraw" />
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
