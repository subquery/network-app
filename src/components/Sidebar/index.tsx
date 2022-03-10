// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/react-ui';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';
import { useTranslation } from 'react-i18next';
import { AiOutlineBarChart } from 'react-icons/ai';
import clsx from 'clsx';

export const Sidebar: React.VFC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const activeNavLink = (path: string) => {
    const isActive = location.pathname.includes(path);
    if (isActive) {
      return styles.activeNav;
    }
  };

  const sidebarList = [
    {
      label: t('indexer.profile'),
      link: '/staking',
      icon: <AiOutlineBarChart />,
      activeStyle: activeNavLink('indexer/'),
    },
    {
      label: t('delegate.title'),
      link: `/staking/indexers`,
      icon: <AiOutlineBarChart />,
      activeStyle: activeNavLink(`indexers`),
    },
  ];

  return (
    <div className={styles.sidebar}>
      {sidebarList.map((sidebarItem) => (
        <NavLink
          className={(isActive) => clsx(styles.navLink, isActive && styles.activeNav)}
          to={sidebarItem.link}
          key={sidebarItem.link}
        >
          {sidebarItem.icon}
          <Typography className={`${styles.navLinkText} ${sidebarItem.activeStyle}`}>{sidebarItem.label}</Typography>
        </NavLink>
      ))}
    </div>
  );
};
