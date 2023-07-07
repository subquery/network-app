// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Routes } from 'react-router';
import { useWeb3 } from '@containers';
import { Footer } from '@subql/components';
import { ROUTES } from '@utils';

import { Rewards } from './Rewards/Rewards';
import { Withdrawn } from './Withdrawn/Withdrawn';
import styles from './Account.module.css';
import { MyAccount } from './MyAccount';

const { REWARDS, WITHDRAWN } = ROUTES;

const Account: React.FC = () => {
  const { account } = useWeb3();
  return (
    <div className={styles.account}>
      <div className={styles.page}>
        <Routes>
          <Route path={REWARDS} element={<Rewards delegator={account ?? ''} />} />
          <Route path={WITHDRAWN} element={<Withdrawn delegator={account ?? ''} />} />
          <Route path={'/'} element={<MyAccount />} />
        </Routes>
      </div>
      <Footer simple />
    </div>
  );
};

export default Account;
