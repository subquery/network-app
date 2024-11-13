// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from '@components/AppSidebar';
import { DelegatorSidebar } from '@utils/links';

const Delegator: React.FC = () => {
  return (
    <AppSidebar list={DelegatorSidebar}>
      <Outlet></Outlet>
    </AppSidebar>
  );
};

export default Delegator;
