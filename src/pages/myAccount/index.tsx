// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3 } from '@containers';
import * as React from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { ROUTES } from '../../utils';
import { Rewards } from './Rewards/Rewards';

const { MY_ACCOUNT, REWARDS } = ROUTES;

export const MyAccount: React.FC = () => {
  const { account } = useWeb3();
  return (
    <Routes>
      <Route path={`${MY_ACCOUNT}/*`} element={<> MY ACCOUNT</>} />
      <Route path={`${REWARDS}`} element={<Rewards delegator={account ?? ''} />} />
      <Route path={'/'} element={<Navigate replace to={MY_ACCOUNT} />} />
    </Routes>
  );
};
