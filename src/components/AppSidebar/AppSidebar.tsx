// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './AppSidebar.module.css';
import { Sidebar } from '../Sidebar';
import { Footer } from '@subql/components';

type Props = {
  list: {
    label: string;
    link: string;
    icon?: React.ReactElement;
  }[];
  children: React.ReactNode;
};

export const AppSidebar: React.FC<Props> = ({ list, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Sidebar list={list} />
      </div>
      <div className={styles.content}>
        <div className={styles.mainContent}>{children}</div>
        <div className={styles.footer}>
          <Footer simple />
        </div>
      </div>
    </div>
  );
};
