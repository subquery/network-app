// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Outlet } from 'react-router';
import { IndexerSidebar } from '@utils/links';

import { AppSidebar } from '../../components';

const Indexer: React.FC = () => {
  return (
    <AppSidebar list={IndexerSidebar}>
      <Outlet></Outlet>
    </AppSidebar>
  );
};

export default Indexer;
