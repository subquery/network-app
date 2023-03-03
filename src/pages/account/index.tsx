// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3 } from '@containers';
import * as React from 'react';
import { Route, Routes } from 'react-router';
import { ROUTES } from '@utils';
import { MyAccount } from './MyAccount';
import { Rewards } from './Rewards/Rewards';
import { Withdrawn } from './Withdrawn/Withdrawn';

const { REWARDS, WITHDRAWN } = ROUTES;

export const Account: React.VFC = () => {
  const { account } = useWeb3();
  return (
    <Routes>
      <Route path={REWARDS} element={<Rewards delegator={account ?? ''} />} />
      <Route path={WITHDRAWN} element={<Withdrawn delegator={account ?? ''} />} />
      <Route path={'/'} element={<MyAccount />} />
    </Routes>
  );
};
