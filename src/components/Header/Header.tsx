// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';
import { Dropdown } from '..';
import { useWeb3 } from '../../containers';
import { injectedConntector } from '../../containers/Web3';
import Button from '../Button';
import styles from './Header.module.css';
import buttonStyles from '../Button/Button.module.css';
import Address from '../Address';

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

  const renderLink = (to: string, text: string) => {
    return (
      <NavLink to={to} className={styles.navLink} activeClassName={styles.navLinkCurrent}>
        {text}
      </NavLink>
    );
  };

  const handleSelected = (key: string) => {
    if (key === 'disconnect') {
      deactivate();
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link to="/">
            <img src="/static/logo.png" className={styles.logo} alt="SubQuery logo" />
          </Link>
          {renderLink('/explorer', t('header.explorer'))}
          {renderLink('/studio', t('header.studio'))}
          <a href="https://doc.subquery.network" target="_blank" className={styles.navLink} rel="noreferrer">
            {t('header.documentation')}
          </a>
          <a href="https://github.com/subquery/subql" target="_blank" className={styles.navLink} rel="noreferrer">
            {t('header.github')}
          </a>
        </div>
        <div className={styles.right}>
          {account ? (
            <Dropdown
              items={[{ key: 'disconnect', label: 'Disconnect' }]}
              onSelected={handleSelected}
              dropdownClass={[buttonStyles.secondary, styles.dropdown].join(' ')}
            >
              <Address address={account} size="large" />
            </Dropdown>
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
