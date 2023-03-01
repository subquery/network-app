// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './TabButton.module.css';
import { AppTypography } from '..';
import { Tabs as SqTabs, TabsPros as SqTabsProps } from '@subql/components';

interface TabsProps extends SqTabsProps {
  subNav: boolean;
}
export const Tabs: React.FC<TabsProps> = ({ subNav, ...props }) => {
  return subNav ? (
    <div className={styles.subTab}>
      <SqTabs tabs={props.tabs}></SqTabs>
    </div>
  ) : (
    <div className={styles.myTab}>
      <SqTabs tabs={props.tabs}></SqTabs>
    </div>
  );
};
