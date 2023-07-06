// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { WalletRoute } from '@components';
import { useStudioEnabled } from '@hooks';

import Create from './Create';
import Home from './Home';
import Project from './Project';

const Studio: React.FC = () => {
  const studioEnabled = useStudioEnabled();
  const navigate = useNavigate();
  if (!studioEnabled) {
    navigate('/');
  }
  return (
    <WalletRoute
      element={
        <div className="fullWidth">
          <Routes>
            <Route path="create" element={<Create />} />
            <Route path="project/:id/*" element={<Project />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      }
    ></WalletRoute>
  );
};

export default Studio;
