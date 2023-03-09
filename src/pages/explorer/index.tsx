// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Routes } from 'react-router';
import Home from './Home';
import { Project } from './Project';

export const Explorer: React.FC = () => {
  return (
    <Routes>
      <Route path={`project/:id/*`} element={<Project />} />
      <Route path={'/'} element={<Home />} />
    </Routes>
  );
};
