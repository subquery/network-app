// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';
import clsx from 'clsx';
import { useWeb3 } from '../../containers';
import { Button, Typography } from '@subql/react-ui';
import styles from './Header.module.css';
import { Dropdown } from '../Dropdown';
import { ConnectWalletButton } from '../ConnectWalletButton';
import { AccountActions } from '../AccountActions';
import { ROUTES } from '../../utils';

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
      link: ROUTES.EXPLORER,
      title: t('header.explorer'),
    },
    // {
    //   link: ROUTES.STUDIO,
    //   title: t('header.studio'),
    // },
    {
      link: ROUTES.STAKING,
      title: t('header.staking'),
    },
    {
      link: ROUTES.PLANS,
      title: t('header.plans'),
    },
    {
      link: ROUTES.INDEXER,
      title: t('indexer.title'),
    },
    {
      link: ROUTES.CONSUMER,
      title: t('consumer'),
    },
    {
      link: ROUTES.DELEGATOR,
      title: t('delegator'),
    },
    {
      link: ROUTES.SWAP,
      title: t('header.swap'),
    },
    {
      link: 'https://snapshot.org/#/subquerynetwork.eth',
      title: t('header.governance'),
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
    const isInternalLink = !to.startsWith('https');

    if (isInternalLink) {
      return (
        <Typography>
          <NavLink to={to} className={({ isActive }) => clsx(styles.navLink, isActive && styles.navLinkCurrent)}>
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
        colorScheme="neutral"
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
  const { account } = useWeb3();
  const { t } = useTranslation();

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
        <div className={styles.right}>{account ? <AccountActions account={account} /> : <ConnectWalletButton />}</div>
      </div>
    </div>
  );
};

export default Header;
