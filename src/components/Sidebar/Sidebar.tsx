// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import clsx from 'clsx';

type Props = {
  list: {
    label: string;
    link: string;
  }[];
};

export const Sidebar: React.VFC<Props> = ({ list }) => {
  return (
    <div className={styles.sidebar}>
      {list.map((sidebarItem) => (
        <NavLink
          className={({ isActive }) => clsx(styles.navLink, isActive && styles.activeNav)}
          to={sidebarItem.link}
          key={sidebarItem.link}
        >
          <Typography>{sidebarItem.label}</Typography>
        </NavLink>
      ))}
    </div>
  );
};
