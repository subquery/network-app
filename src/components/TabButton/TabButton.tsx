// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';

import { AppTypography } from '..';
import styles from './TabButton.module.less';

interface TabButtonProps {
  label: string;
  link: string;
  whiteTab?: boolean;
  tooltip?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ label, link, whiteTab, tooltip }) => {
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
  withUnderline?: boolean;
}

export const TabButtons: React.FC<TabButtonsProps> = ({ tabs, whiteTab, withUnderline = false }) => {
  return (
    <div
      className={clsx(
        styles.tabContainer,
        whiteTab && styles.whiteTabContainer,
        withUnderline ? styles.withUnderline : '',
        'tabButtons',
      )}
    >
      {tabs.map((tab) => (
        <TabButton key={tab.link} {...tab} whiteTab={whiteTab} />
      ))}
    </div>
  );
};
