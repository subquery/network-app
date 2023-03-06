// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Toast } from '@subql/react-ui';
import React from 'react';
import { Route } from 'react-router';
import { ConnectWallet } from './components';
import { useWeb3 } from './containers';
import { useWeb3Store } from './stores';
import { parseError, walletConnectionErrors } from './utils';
import styles from './WalletRoute.module.css';

type WalletRouteProps = React.ComponentProps<typeof Route> & { title?: string; subtitle?: string; element: React.VFC };

export const WalletRoute: React.FC<WalletRouteProps> = ({ title, subtitle, element: Element }) => {
  const [errorAlert, setErrorAlert] = React.useState<string>();

  const { account, error, active } = useWeb3();
  const { isInitialAccount } = useWeb3Store();

  React.useEffect(() => {
    if (error) {
      setErrorAlert(parseError(error, walletConnectionErrors) || 'Failed to connect wallet.');
    }
  }, [error]);

  if (isInitialAccount) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  if (!account) {
    return (
      <div className={styles.container}>
        {errorAlert && <Toast state="error" text={errorAlert} className={styles.error} />}
        <ConnectWallet title={title} subTitle={subtitle} />
      </div>
    );
  }

  return <Element />;
};
