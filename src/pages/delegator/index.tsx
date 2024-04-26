// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { AppSidebar } from '../../components';
import { ROUTES } from '../../utils';

const { DELEGATOR_INDEXERS, DELEGATING } = ROUTES;

const Delegator: React.FC = () => {
  const sidebarList = [
    {
      label: 'My Delegation',
      link: DELEGATING,
    },
    {
      label: 'Node Operators',
      link: DELEGATOR_INDEXERS,
    },
  ];
  return (
    <AppSidebar list={sidebarList}>
      <Outlet></Outlet>
    </AppSidebar>
  );
};

export default Delegator;
