// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';
import testnet from '@subql/contract-sdk/publish/testnet.json';
import { useWeb3 } from '../../containers';
import { injectedConntector } from '../../containers/Web3';
import { Address, Button, Typography } from '@subql/react-ui';
import styles from './Header.module.css';
import clsx from 'clsx';
import { AiOutlineDown } from 'react-icons/ai';
import { Dropdown } from '../Dropdown';

const LinksDropdown = () => {
  const { t } = useTranslation();
  const menu = [
    { key: 'https://explorer.subquery.network', label: 'Explorer' },
    { key: 'https://project.subquery.network', label: 'Projects' },
    { key: 'https://github.com/subquery/subql', label: 'Github' },
  ];

  const handleOnClick = (key: string) => (window.location.href = key);

  return <Dropdown menu={menu} handleOnClick={handleOnClick} dropdownContent={t('header.hosted')} />;
};

const renderLink = (to: string, text: string) => {
  return (
    <Typography>
      <NavLink to={to} className={(isActive) => clsx(styles.navLink, isActive && styles.navLinkCurrent)}>
        {text}
      </NavLink>
    </Typography>
  );
};

const Header: React.VFC = () => {
  const { account, activate, deactivate } = useWeb3();
  const { t } = useTranslation();

  const handleConnectWallet = React.useCallback(async () => {
    if (account) {
      deactivate();
      return;
    }

    try {
      await activate(injectedConntector);
    } catch (e) {
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account, deactivate]);

  const handleSelected = (key: string) => {
    if (key === 'disconnect') {
      deactivate();
    }

    if (key === 'addToken') {
      window.ethereum?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: testnet.SQToken.address,
            symbol: 'SQT',
            decimals: 18,
            // image: 'https://foo.io/token-image.svg',
          },
        },
      });
    }
  };

  const AccountActions = ({ account }: { account: string }) => {
    const { t } = useTranslation();
    const menu = [
      { key: 'addToken', label: 'Import SQT to wallet' },
      { key: 'disconnect', label: 'Disconnect' },
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

  const headerEntryLinks = [
    {
      link: '/explorer',
      title: t('header.explorer'),
    },
    // {
    //   link: '/studio',
    //   title: t('header.studio'),
    // },
    {
      link: '/staking',
      title: t('header.staking'),
    },
    {
      link: '/plans',
      title: t('header.plans'),
    },
    {
      link: '/missions',
      title: t('header.missions'),
    },
  ];

  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/">
            <img src="/static/logo.png" className={styles.logo} alt="SubQuery logo" />
          </Link>
          <LinksDropdown />
          <>
            {headerEntryLinks.map((headerLink) => (
              <div key={headerLink.link}>{renderLink(headerLink.link, headerLink.title)}</div>
            ))}
          </>
          <Button
            href="https://doc.subquery.network"
            target="_blank"
            className={styles.navLink}
            rel="noreferrer"
            type="link"
            label={t('header.documentation')}
            colorScheme="standard"
          />
          {/*<a href="https://github.com/subquery/subql" target="_blank" className={styles.navLink} rel="noreferrer">
            {t('header.github')}
          </a>*/}
        </div>
        <div className={styles.right}>
          {account ? (
            <AccountActions account={account} />
          ) : (
            <Button
              type="secondary"
              label={t('header.connectWallet')}
              onClick={handleConnectWallet}
              leftItem={<i className={`bi-link-45deg`} role="img" aria-label="link" />}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
