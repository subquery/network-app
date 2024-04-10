// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { CSSProperties } from 'react';
import { Route } from 'react-router';
import { ConnectWallet } from '@components/ConnectWallet';
import { useIsLogin } from '@hooks/useIsLogin';
import { Spinner, Toast } from '@subql/components';
import { parseError, walletConnectionErrors } from '@utils';
import clsx from 'clsx';
import { useConnect } from 'wagmi';

import { useWeb3Store } from 'src/stores';

import styles from './WalletRoute.module.css';

type WalletRouteProps = React.ComponentProps<typeof Route> & {
  title?: string;
  subtitle?: string;
  element: React.ReactNode;
  componentMode?: boolean;
  connectWalletStyle?: CSSProperties;
};

export const WalletRoute: React.FC<WalletRouteProps> = ({
  title,
  subtitle,
  element: Element,
  componentMode = false,
  connectWalletStyle,
}) => {
  const [errorAlert, setErrorAlert] = React.useState<string>();

  const { error } = useConnect();
  const { isInitialAccount } = useWeb3Store();
  const isLogin = useIsLogin();

  React.useEffect(() => {
    if (error) {
      setErrorAlert(
        parseError(error, {
          errorMappings: walletConnectionErrors,
        }) || 'Failed to connect wallet.',
      );
    }
  }, [error]);

  if (isInitialAccount) {
    return (
      <div className={styles.container}>
        <Spinner />
      </div>
    );
  }

  if (!isLogin) {
    return (
      <div className={clsx(styles.container, componentMode && styles.componentMode)}>
        {errorAlert && <Toast state="error" text={errorAlert} className={styles.error} />}
        <ConnectWallet
          title={title}
          subTitle={subtitle}
          className={componentMode ? styles.componentModeWallet : ''}
          style={connectWalletStyle}
        />
      </div>
    );
  }

  return <>{Element}</>;
};
