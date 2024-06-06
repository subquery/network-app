// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { DelegatorSidebar } from '@utils/links';

import { AppSidebar } from '../../components';

const Delegator: React.FC = () => {
  return (
    <AppSidebar list={DelegatorSidebar}>
      <Outlet></Outlet>
    </AppSidebar>
  );
};

export default Delegator;
