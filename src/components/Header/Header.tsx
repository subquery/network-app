// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, Link } from 'react-router-dom';
import { useWeb3 } from '../../containers';
import { injectedConntector } from '../../containers/Web3';
import { truncateAddress } from '../../utils';
import Button from '../Button';
import styles from './Header.module.css';

const Header: React.VFC = () => {
  const { account, activate } = useWeb3();
  const { t } = useTranslation();

  const walletLabel = React.useMemo(
    () => (account ? truncateAddress(account) : t('header.connectWallet')),
    [account, t],
  );

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  const renderLink = (to: string, text: string) => {
    return (
      <NavLink to={to} className={styles.navLink} activeClassName={styles.navLinkCurrent}>
        {text}
      </NavLink>
    );
  };

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <Link to="/">
          <img src="/static/logo.png" className={styles.logo} alt="SubQuery logo" />
        </Link>
        {renderLink('/explorer', t('header.explorer'))}
        {renderLink('/studio', t('header.studio'))}
      </div>
      <div className={styles.right}>
        <Button type="secondary" label={walletLabel} onClick={handleConnectWallet} />
      </div>
    </div>
  );
};

export default Header;
