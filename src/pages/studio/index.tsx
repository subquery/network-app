// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Routes } from 'react-router';
import Create from './Create';
import Home from './Home';
import Project from './Project';

export const Studio: React.FC = () => {
  return (
    <div className="fullWidth">
      <Routes>
        <Route path="create" element={<Create />} />
        <Route path="project/:id" element={<Project />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};
