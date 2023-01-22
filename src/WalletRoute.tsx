// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Toast } from '@subql/react-ui';
import React from 'react';
import { Route } from 'react-router';
import { ConnectWallet } from './components';
import { useWeb3 } from './containers';
import { parseError, walletConnectionErrors } from './utils';
import styles from './WalletRoute.module.css';

export const WalletRoute: React.VFC<
  React.ComponentProps<typeof Route> & { title?: string; subtitle?: string; element: React.VFC }
> = ({ title, subtitle, element: Element }) => {
  const { account, error } = useWeb3();
  const [errorAlert, setErrorAlert] = React.useState<string>();

  React.useEffect(() => {
    if (error) {
      setErrorAlert(parseError(error, walletConnectionErrors) || 'Failed to connect wallet.');
    }
  }, [error]);

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
