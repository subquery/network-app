// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button } from '../../../components';
import { useWeb3 } from '../../../containers';
import { injectedConntector } from '../../../containers/Web3';
import styles from './Home.module.css';

const Home: React.VFC = () => {
  const { account, activate } = useWeb3();

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  if (!account) {
    return (
      <div className={styles.container}>
        <div className={styles.connectWallet}>
          <span className={styles.mainText}>Connect Wallet to use Studio</span>
          <Button type="secondary" label="Connect Wallet" onClick={handleConnectWallet} />
        </div>
      </div>
    );
  }
  return <h3>Studio home</h3>;
};

export default Home;
