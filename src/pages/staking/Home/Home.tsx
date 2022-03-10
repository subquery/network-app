// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useWeb3 } from '../../../containers';
import { useHistory } from 'react-router';
import { ConnectWallet } from '../../../components';
import styles from './Home.module.css';
import { injectedConntector } from '../../../containers/Web3';
import { Toast } from '@subql/react-ui';

export const Home: React.VFC<any> = (children) => {
  const [errorAlert, setErrorAlert] = React.useState<string | null>();
  const { account, activate, error } = useWeb3();
  const history = useHistory();

  const indexerUrl = `/staking/indexer/${account}`;

  React.useEffect(() => {
    if (account) {
      history.push(indexerUrl);
    }
  }, [account, history, indexerUrl]);

  React.useEffect(() => {
    if (error) {
      setErrorAlert(error.message || 'Failed to connect wallet.');
    }
  }, [error]);

  const handleConnectWallet = React.useCallback(async () => {
    if (account) return;

    try {
      await activate(injectedConntector);
    } catch (e) {
      setErrorAlert('Failed to activate wallet');
      console.log('Failed to activate wallet', e);
    }
  }, [activate, account]);

  // TODO: Update ConnectWallet component
  if (!account) {
    return (
      <div className={styles.container}>
        {errorAlert && <Toast state="error" text={errorAlert} className={styles.error} />}
        <div className={styles.connectWallet}>
          <ConnectWallet onConnect={handleConnectWallet} />
        </div>
      </div>
    );
  }

  return <></>;
};
