// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { OutlineDot } from '@components/Icons/Icons';
import { Dropdown } from 'antd';

import { BillingExchangeModal } from '../../../components/BillingTransferModal';

export const BillingAction: React.FC = () => {
  return (
    <Dropdown
      menu={{
        items: [
          {
            label: <BillingExchangeModal action="Transfer" />,
            key: 1,
          },
          {
            label: <BillingExchangeModal action="Withdraw" />,
            key: 2,
          },
        ],
      }}
    >
      <OutlineDot></OutlineDot>
    </Dropdown>
  );
};
