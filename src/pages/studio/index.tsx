// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Routes, useNavigate } from 'react-router';
import { WalletRoute } from '@components';
import { useStudioEnabled } from '@hooks';
import { Footer } from '@subql/components';

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

          <Footer simple></Footer>
        </div>
      }
    ></WalletRoute>
  );
};

export default Studio;
