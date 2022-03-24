// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './ProjectSidebar.module.css';
import { Sidebar } from '../Sidebar';

type Props = {
  list: {
    label: string;
    link: string;
    icon: React.ReactElement;
  }[];
  children: React.ReactNode;
};

export const ProjectSidebar: React.VFC<Props> = ({ list, children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Sidebar list={list} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
