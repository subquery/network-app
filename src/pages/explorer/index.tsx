// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Outlet } from 'react-router';
import { Footer } from '@subql/components';

import styles from './Explorer.module.css';

const Explorer: React.FC = () => {
  return (
    <div className={styles.account}>
      <div className={styles.page}>
        <Outlet></Outlet>
      </div>
      <Footer simple />
    </div>
  );
};

export default Explorer;
