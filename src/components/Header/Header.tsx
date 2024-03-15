// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { matchPath } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { AccountActions } from '@components/AccountActions';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button, Header as SubqlHeader } from '@subql/components';
import { entryLinks, externalAppLinks } from '@utils/links';
import clsx from 'clsx';
import { useAccount } from 'wagmi';

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
    if (!account || (projects.data?.projects?.totalCount || 0) === 0) {
      return entryLinks.map((i) => {
        return {
          ...i,
          dropdown: i.key === 'explorer' ? undefined : i.dropdown,
        };
      });
    }

    return entryLinks;
  }, [account, projects.data]);

  return (
    <div className={styles.header}>
      <SubqlHeader
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
