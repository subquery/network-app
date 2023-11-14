// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineDown } from 'react-icons/ai';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { Address } from '@subql/components';
import { useDisconnect, useWalletClient } from 'wagmi';

import { useSQToken } from '../../containers';
import { formatEther, ROUTES, STABLE_TOKEN, STABLE_TOKEN_ADDRESS, TOKEN, tokenDecimals } from '../../utils';
import { Dropdown } from '../Dropdown';
import styles from './AccountActions.module.css';

export const AccountActions: React.FC<{ account: string }> = ({ account }) => {
  const { t } = useTranslation();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { balance } = useSQToken();
  const { data: walletClient } = useWalletClient();

  const handleDisconnect = () => disconnect();
  const handleNavRewards = () => navigate(ROUTES.MY_PROFILE_REWARDS_NAV);
  const handleNavWithdrawn = () => navigate(ROUTES.MY_PROFILE_WITHDRAWN_NAV);
  const handleNavAccount = () => navigate(ROUTES.MY_PROFILE);
  const handleAddToken = () => {
    walletClient?.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: SQT_TOKEN_ADDRESS,
          symbol: TOKEN,
          decimals: tokenDecimals[SQT_TOKEN_ADDRESS],
        },
      },
    });
  };

  const handleAddStableToken = () => {
    walletClient?.request({
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
  };

  const menu = [
    { key: 'walletBalance', label: t('header.walletBalance', { balance: formatEther(balance.data, 4) }) },
    { key: 'addToken', label: t('header.importToken'), onClick: handleAddToken },
    { key: 'addStableToken', label: t('header.importStableToken'), onClick: handleAddStableToken },
    { key: 'myProfile', label: t('indexer.myProfile'), onClick: handleNavAccount },
    { key: 'rewards', label: t('indexer.rewards'), onClick: handleNavRewards },
    { key: 'withdrawn', label: t('indexer.withdrawn'), onClick: handleNavWithdrawn },
    { key: 'disconnect', label: t('header.disconnect'), icon: <BsBoxArrowLeft />, onClick: handleDisconnect },
  ];

  return (
    <Dropdown
      menu={menu}
      dropdownContent={
        <div className={styles.address}>
          <Address address={account} size="large" />
          <AiOutlineDown className={styles.downIcon} />
        </div>
      }
    />
  );
};
