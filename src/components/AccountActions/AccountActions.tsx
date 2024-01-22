// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineDown } from 'react-icons/ai';
import { BsBoxArrowInUpRight, BsBoxArrowLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import { Address, Typography } from '@subql/components';
import { Button, Dropdown, Tooltip } from 'antd';
import { useDisconnect, useWalletClient } from 'wagmi';

import { BRIDGE_URL } from 'src/const/bridge';

import { useSQToken } from '../../containers';
import { formatEther, ROUTES, STABLE_TOKEN, STABLE_TOKEN_ADDRESS, TOKEN, tokenDecimals } from '../../utils';
import styles from './AccountActions.module.less';

export const AccountActions: React.FC<{ account: string }> = ({ account }) => {
  const { t } = useTranslation();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { balance, ethSqtBalance, consumerHostBalance } = useSQToken();
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
    {
      key: 'header',
      label: (
        <div style={{ padding: '0 16px' }}>
          <Address address={account} size="bigger"></Address>
        </div>
      ),
    },
    {
      key: 'walletBalance',
      label: (
        <div className="flex" style={{ gap: 16, padding: '16px' }}>
          <div className="col-flex" style={{ gap: 8 }}>
            <Typography variant="small" type="secondary">
              Wallet balance on Polygon
            </Typography>
            <Typography weight={600}>
              {formatEther(balance.result.data, 4)} {TOKEN}
            </Typography>
          </div>
          <div className="col-flex" style={{ gap: 8 }}>
            <Typography variant="small" type="secondary">
              Wallet balance on Ethereum
              <Tooltip
                color="#fff"
                title={
                  <Typography variant="small">
                    SubQuery launched on Polygon network, To move assets from the Ethereum network to Polygon network,
                    you'll need to connect to a bridge and deposit funds.
                  </Typography>
                }
                overlayInnerStyle={{
                  padding: 16,
                }}
              >
                <InfoCircleOutlined style={{ marginLeft: 8 }} />
              </Tooltip>
            </Typography>
            <Typography weight={600}>
              {formatEther(ethSqtBalance.result.data, 4)} {TOKEN}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      key: 'bridge tokens',
      label: (
        <div style={{ padding: '0 16px 8px 16px' }}>
          <a href={BRIDGE_URL} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <Button
              shape="round"
              size="large"
              type="primary"
              ghost
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
            >
              Bridge Tokens
              <BsBoxArrowInUpRight />
            </Button>
          </a>
        </div>
      ),
    },
    {
      key: 'billingBalance',
      label: (
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--sq-gray200)',
            borderBottom: '1px solid var(--sq-gray200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography>Billing Balance:</Typography>
            <Typography>
              {formatEther(consumerHostBalance.result.data?.balance, 4)} {TOKEN}
            </Typography>
          </div>
        </div>
      ),
    },
    {
      key: 'addTokens',
      label: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 0',
            borderBottom: '1px solid var(--sq-gray200)',
          }}
        >
          <div className={styles.dropdownItemInner}>
            <Typography onClick={handleAddToken}>{t('header.importToken')}</Typography>
          </div>
          <div className={styles.dropdownItemInner}>
            <Typography onClick={handleAddStableToken}>{t('header.importStableToken')}</Typography>
          </div>
        </div>
      ),
    },
    {
      key: 'myProfile',
      label: (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '8px 0',
            borderBottom: '1px solid var(--sq-gray200)',
          }}
        >
          <div className={styles.dropdownItemInner} onClick={handleNavAccount}>
            {t('indexer.myProfile')}
          </div>
          <div className={styles.dropdownItemInner} onClick={handleNavRewards}>
            {t('indexer.rewards')}
          </div>
          <div className={styles.dropdownItemInner} onClick={handleNavWithdrawn}>
            {t('indexer.withdrawn')}
          </div>
        </div>
      ),
    },
    {
      key: 'disconnect',
      label: (
        <div style={{ padding: '8px 0 0 0' }}>
          <div className={styles.dropdownItemInner} onClick={handleDisconnect}>
            <BsBoxArrowLeft style={{ marginRight: 8 }} /> {t('header.disconnect')}
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      overlayClassName={styles.accountActionDropdown}
      menu={{ items: menu }}
      placement="bottom"
      arrow={{ pointAtCenter: true }}
    >
      <div className={styles.address}>
        <Address address={account} size="large" />
        <AiOutlineDown className={styles.downIcon} />
      </div>
    </Dropdown>
  );
};
