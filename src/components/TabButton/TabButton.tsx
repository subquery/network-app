// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Typography } from '@subql/react-ui';
import clsx from 'clsx';
import styles from './TabButton.module.css';

interface TabButtonProps {
  label: string;
  link: string;
  whiteTab?: boolean;
}

export const TabButton: React.VFC<TabButtonProps> = ({ label, link, whiteTab }) => {
  return (
    <NavLink
      to={link}
      className={(isActive) => clsx(styles.tab, isActive && styles.tabSelected, whiteTab && styles.whiteTab)}
      replace
    >
      <Typography className={clsx(whiteTab && styles.whiteTabLabel)}>{label}</Typography>
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
        <TabButton key={tab.link} label={tab.label} link={tab.link} whiteTab={whiteTab} />
      ))}
    </div>
  );
};
