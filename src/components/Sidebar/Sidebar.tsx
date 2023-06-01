// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Typography } from '@subql/components';
import clsx from 'clsx';

import styles from './Sidebar.module.css';

type Props = {
  list: {
    label: string;
    link: string;
    icon?: React.ReactElement;
  }[];
};

export const Sidebar: React.FC<Props> = ({ list }) => {
  return (
    <div className={styles.sidebar}>
      {list.map((sidebarItem) => (
        <NavLink
          className={({ isActive }) => clsx(styles.navLink, isActive && styles.activeNav)}
          to={sidebarItem.link}
          key={sidebarItem.link}
        >
          {sidebarItem?.icon}
          <Typography className={styles.label}>{sidebarItem.label}</Typography>
        </NavLink>
      ))}
    </div>
  );
};
