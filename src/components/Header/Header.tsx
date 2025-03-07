// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { BiChart } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { AccountActions } from '@components/AccountActions';
import NotificationCentre from '@components/NotificationCentre';
import { useAccount } from '@containers/Web3';
import { useIsMobile } from '@hooks/useIsMobile';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Header as SubqlHeader } from '@subql/components';
import { entryLinks, externalAppLinks } from '@utils/links';
import clsx from 'clsx';

import styles from './Header.module.less';

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

export const Header: React.FC = () => {
  const { address: account } = useAccount();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const projects = useQuery(gql`
    query {
      projects(
        filter: { owner: { equalTo: "${account}" } }
      ) {
        totalCount
        
      }
    }
  `);

  const renderEntryLinks = React.useMemo(() => {
    const hideExplorerDropdown = !account || (projects.data?.projects?.totalCount || 0) === 0;

    if (isMobile) {
      return entryLinks.map((i) => {
        if (i.key === 'explorer') {
          return {
            ...i,
            dropdown: hideExplorerDropdown ? undefined : i.dropdown,
          };
        }
        return {
          ...i,
          link: ['indexer', 'consumer', 'delegator'].includes(i.key || '') ? undefined : i.link,
        };
      });
    }

    return entryLinks.map((i) => {
      if (i.key === 'explorer') {
        return {
          ...i,
          dropdown: hideExplorerDropdown ? undefined : i.dropdown,
        };
      }

      return {
        ...i,
        dropdown: ['indexer', 'consumer', 'delegator'].includes(i.key || '') ? undefined : i.dropdown,
      };
    });
  }, [account, projects.data, isMobile]);

  return (
    <div className={styles.header}>
      <SubqlHeader
        customLogo={<img src="/static/logo.png" width="140px"></img>}
        closeDrawerAfterNavigate
        navigate={(link) => {
          navigate(link);
        }}
        appNavigation={renderEntryLinks}
        active={(to) => {
          if (window.location.pathname.startsWith(to) || window.location.pathname.startsWith(`/${to}`)) return true;
          return false;
        }}
        dropdownLinks={{ label: 'SubQuery Network', links: externalAppLinks }}
        rightElement={
          <>
            <span style={{ flex: 1 }}></span>
            <div style={{ marginRight: 16 }}>
              <NotificationCentre></NotificationCentre>
            </div>
            <div className={clsx(styles.right)}>
              {account ? (
                <AccountActions account={account} />
              ) : (
                <ConnectButton.Custom>
                  {({ openConnectModal }) => {
                    return (
                      <Button
                        onClick={() => {
                          openConnectModal();
                        }}
                        type="secondary"
                        label="Connect"
                        style={{
                          width: '100%',
                        }}
                      ></Button>
                    );
                  }}
                </ConnectButton.Custom>
              )}
            </div>
          </>
        }
      ></SubqlHeader>
    </div>
  );
};

export const ScannerHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.scannerHeader}>
      <SubqlHeader
        customLogo={
          <img src="/logo-new.svg" width="140px" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}></img>
        }
        closeDrawerAfterNavigate
        navigate={(link) => {
          navigate(link);
        }}
        appNavigation={[
          {
            link: '/dashboard',
            // TODO: fix this type
            // @ts-ignore
            label: (
              <span className="flex" style={{ gap: 4 }}>
                <BiChart style={{ fontSize: 20 }} />
                Dashboard
              </span>
            ),
            active: () => {
              return window.location.pathname.includes('dashboard');
            },
          },
          {
            link: '/project-deployment-rewards',
            // @ts-ignore
            label: (
              <span className="flex" style={{ gap: 4 }}>
                <BiChart style={{ fontSize: 20 }} />
                Project Deployment Rewards
              </span>
            ),
            active: () => {
              return window.location.pathname.includes('project-deployment-reward');
            },
          },
          {
            link: '/node-operators',
            // @ts-ignore
            label: (
              <span className="flex" style={{ gap: 4 }}>
                <BiChart style={{ fontSize: 20 }} />
                Node Operators
              </span>
            ),
            active: () => {
              return window.location.pathname.includes('node-operator');
            },
          },
        ]}
        active={(to) => {
          if (window.location.pathname.startsWith(to) || window.location.pathname.startsWith(`/${to}`)) return true;
          return false;
        }}
      ></SubqlHeader>
    </div>
  );
};
