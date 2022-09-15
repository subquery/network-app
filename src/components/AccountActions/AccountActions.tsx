// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '../../containers';
import { Address } from '@subql/react-ui';
import styles from './AccountActions.module.css';
import { AiOutlineDown } from 'react-icons/ai';
import { Dropdown } from '../Dropdown';
import { SQT_TOKEN_ADDRESS, STABLE_TOKEN, STABLE_TOKEN_ADDRESS, TOKEN, tokenDecimals } from '../../utils';
import { getConnectorConfig } from '../../containers/Web3';

export const AccountActions: React.FC<{ account: string }> = ({ account }) => {
  const { deactivate, connector } = useWeb3();
  const { t } = useTranslation();
  const sortedWindowObj = getConnectorConfig(connector).windowObj;

  const handleSelected = (key: string) => {
    if (key === 'disconnect') {
      deactivate();
    }

    if (key === 'addToken') {
      sortedWindowObj?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: SQT_TOKEN_ADDRESS,
            symbol: TOKEN,
            decimals: tokenDecimals[SQT_TOKEN_ADDRESS],
            // image: 'https://foo.io/token-image.svg',
          },
        },
      });
    }

    if (key === 'addStableToken') {
      sortedWindowObj?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: STABLE_TOKEN_ADDRESS,
            symbol: STABLE_TOKEN,
            decimals: tokenDecimals[STABLE_TOKEN_ADDRESS],
          },
        },
      });
    }
  };

  const menu = [
    { key: 'addToken', label: t('header.importToken') },
    { key: 'addStableToken', label: t('header.importStableToken') },
    { key: 'disconnect', label: t('header.disconnect') },
  ];

  return (
    <Dropdown
      menu={menu}
      handleOnClick={handleSelected}
      dropdownContent={
        <div className={styles.address}>
          <Address address={account} size="large" />
          <AiOutlineDown className={styles.downIcon} />
        </div>
      }
    />
  );
};
