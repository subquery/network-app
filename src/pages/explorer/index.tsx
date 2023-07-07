// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Route, Routes } from 'react-router';
import { Footer } from '@subql/components';

import styles from './Explorer.module.css';
import Home from './Home';
import { Project } from './Project';

const Explorer: React.FC = () => {
  return (
    <div className={styles.account}>
      <div className={styles.page}>
        <Routes>
          <Route path={`project/:id/*`} element={<Project />} />
          <Route path={'/'} element={<Home />} />
        </Routes>
      </div>
      <Footer simple />
    </div>
  );
};

export default Explorer;
