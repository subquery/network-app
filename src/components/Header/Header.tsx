// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import clsx from 'clsx';
import { NavLink, useNavigate } from 'react-router-dom';
import { Space, Divider } from 'antd';
import styles from './Header.module.css';
import { Button, Dropdown, MenuWithDesc, Typography } from '@subql/components/dist/common';
import { AccountActions } from '@components/AccountActions';
import { ConnectWalletButton } from '@components/ConnectWallet';
import { useWeb3 } from '@containers';

export interface AppLink {
  label: string;
  link: string;
}

export interface DetailedLink {
  label: string;
  description: string;
  link: string;
}

export interface DropdownLink {
  label: string;
  links: DetailedLink[];
}

export interface AppNavigation {
  label: string;
  link?: string;
  dropdown?: AppLink[];
}

const isExternalLink = (to: string) => to.startsWith('https') || to.startsWith('http');

const renderLink = (to: string, label: string) => {
  if (!isExternalLink(to)) {
    return (
      <Typography>
        <NavLink to={to} className={({ isActive }) => clsx(styles.navLink, isActive && styles.navLinkCurrent)}>
          {label}
        </NavLink>
      </Typography>
    );
  }

  return (
    <Button
      href={to}
      target="_blank"
      className={styles.navLink}
      rel="noreferrer"
      type="link"
      label={label}
      colorScheme="neutral"
    />
  );
};

export interface LeftHeaderProps {
  leftElement?: React.ReactNode;
  dropdownLinks?: DropdownLink;
  showDivider?: boolean;
}
const LeftHeader = ({ leftElement, dropdownLinks, showDivider }: LeftHeaderProps) => {
  const sortedDropdownLinks = !leftElement && dropdownLinks && (
    <div className={clsx(styles.leftElement, styles.headerHeight)} id="leftHeader">
      <Dropdown
        label={dropdownLinks.label}
        LeftLabelIcon={<img src={'/static/appIcon.svg'} alt="SubQuery Apps" />}
        menuitem={dropdownLinks.links.map((label, key) => ({
          key,
          label: <MenuWithDesc title={label.label} description={label.description} className={styles.dropMenu} />,
        }))}
        active
        menuClassName={styles.menuOverlay}
        onMenuItemClick={({ key }) => {
          window.open(dropdownLinks.links[parseInt(key)]?.link ?? '/', '_blank');
        }}
        getPopupContainer={() => document.getElementById('leftHeader') as HTMLElement}
      />
    </div>
  );

  return (
    <Space>
      <>{leftElement}</>
      <>{sortedDropdownLinks}</>
      {showDivider && <Divider type="vertical" />}
    </Space>
  );
};

export interface MiddleHeaderProps {
  middleElement?: React.ReactNode;
  appNavigation?: AppNavigation[];
}
const MiddleHeader = ({ middleElement, appNavigation }: MiddleHeaderProps) => {
  const navigate = useNavigate();

  const sortedAppNavigation = !middleElement && appNavigation && (
    <Space className={clsx(styles.flexCenter, styles.headerHeight)}>
      {appNavigation.map((nav, idx) => {
        if (nav.dropdown) {
          const dropdownMenu = nav.dropdown.map((menu) => ({ key: menu.link, label: menu.label }));
          return (
            <div key={idx} className={clsx(styles.appDropdown, styles.headerHeight)}>
              <Dropdown
                menuitem={dropdownMenu}
                label={nav.label}
                onMenuItemClick={({ key }) => {
                  if (isExternalLink(key)) {
                    window.open(key, '_blank');
                  } else {
                    navigate(key);
                  }
                }}
              />
            </div>
          );
        }
        return <div key={idx}>{renderLink(nav.link ?? '/', nav.label)}</div>;
      })}
    </Space>
  );

  return (
    <>
      <>{middleElement}</>
      <>{sortedAppNavigation}</>
    </>
  );
};

export interface HeaderProps {
  logoLink?: string;
  dropdownLinks?: DropdownLink;
  appNavigation?: AppNavigation[];
  leftElement?: React.ReactElement;
  middleElement?: React.ReactElement;
  rightElement?: React.ReactElement;
  className?: string;
}

export const Header: React.FC<React.PropsWithChildren<HeaderProps>> = ({
  logoLink,
  dropdownLinks,
  appNavigation,
  leftElement,
  middleElement,
  rightElement,
  className,
}) => {
  const { account } = useWeb3();
  return (
    <div className={clsx(styles.header, styles.flexCenter, rightElement && styles.justifyBetween, className)}>
      <div className={clsx(styles.flexCenter, styles.headerHeight)}>
        <div>
          <a href={logoLink ?? '/'}>
            <img src={'/static/logo.png'} alt="SubQuery Logo" width={140} />
          </a>
        </div>
        <LeftHeader leftElement={leftElement} dropdownLinks={dropdownLinks} showDivider />
        <MiddleHeader middleElement={middleElement} appNavigation={appNavigation} />
      </div>
      <div className={styles.right}>{account ? <AccountActions account={account} /> : <ConnectWalletButton />}</div>
    </div>
  );
};
