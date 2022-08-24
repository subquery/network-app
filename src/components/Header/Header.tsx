// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';
// import testnet from '@subql/contract-sdk/publish/testnet.json';
import testnet from '@subql/contract-sdk/publish/moonbase.json';
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

const HeaderLinks = () => {
  const { t } = useTranslation();

  const entryLinks = [
    {
      link: '/explorer',
      title: t('header.explorer'),
    },
    {
      link: '/staking',
      title: t('header.staking'),
    },
    {
      link: '/plans',
      title: t('header.plans'),
    },
    {
      link: '/swap',
      title: t('header.swap'),
    },
    {
      link: 'https://academy.subquery.network/subquery_network/testnet/welcome.html',
      title: t('header.documentation'),
    },
    {
      link: 'https://forum.subquery.network/c/season-3/6',
      title: t('header.forum'),
    },
  ];

  const renderLink = (to: string, text: string) => {
    const isInternalLink = !to.startsWith('http');

    if (isInternalLink) {
      return (
        <Typography>
          <NavLink to={to} className={(isActive) => clsx(styles.navLink, isActive && styles.navLinkCurrent)}>
            {text}
          </NavLink>
        </Typography>
      );
    }

    return (
      <Button
        href={to}
        target="_blank"
        className={styles.navLink}
        rel="noreferrer"
        type="link"
        label={text}
        colorScheme="standard"
      />
    );
  };

  return (
    <>
      {entryLinks.map((headerLink) => {
        return <div key={headerLink.link}>{renderLink(headerLink.link, headerLink.title)}</div>;
      })}
    </>
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

  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.logo}>
            <Link to="/">
              <img src="/static/kepler-logo.svg" className={styles.logoImg} alt="SubQuery logo" />
            </Link>
          </div>

          <LinksDropdown />
          <HeaderLinks />
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
