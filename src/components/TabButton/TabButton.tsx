// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import styles from './TabButton.module.css';
import { AppTypography } from '..';

interface TabButtonProps {
  label: string;
  link: string;
  whiteTab?: boolean;
  tooltip?: string;
}

export const TabButton: React.VFC<TabButtonProps> = ({ label, link, whiteTab, tooltip }) => {
  const { pathname } = useLocation();

  return (
    <NavLink
      to={link}
      className={({ isActive }) => clsx(styles.tab, isActive && styles.tabSelected, whiteTab && styles.whiteTab)}
      replace
    >
      <AppTypography
        className={clsx(whiteTab && styles.whiteTabLabel)}
        type={pathname === link ? undefined : 'secondary'}
        tooltip={tooltip}
        noTooltipIcon
      >
        {label}
      </AppTypography>
    </NavLink>
  );
};

interface TabButtonsProps {
  tabs: Array<TabButtonProps>;
  whiteTab?: boolean;
}

export const TabButtons: React.VFC<TabButtonsProps> = ({ tabs, whiteTab }) => {
  return (
    <div className={clsx(styles.tabContainer, whiteTab && styles.whiteTabContainer)}>
      {tabs.map((tab) => (
        <TabButton key={tab.link} {...tab} whiteTab={whiteTab} />
      ))}
    </div>
  );
};
