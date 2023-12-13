// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountActions } from '@components/AccountActions';
import { useStudioEnabled } from '@hooks';
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
  const studioEnabled = useStudioEnabled();
  const calEntryLinks = React.useMemo(() => {
    if (!studioEnabled) {
      return entryLinks.map((entry) => {
        if (entry.key === 'explorer') {
          return {
            ...entry,
            dropdown: undefined,
          };
        }
        return entry;
      });
    }
    return entryLinks;
  }, [studioEnabled]);

  return (
    <div className={styles.header}>
      <SubqlHeader
        navigate={(link) => {
          navigate(link);
        }}
        appNavigation={calEntryLinks}
        dropdownLinks={{ label: 'Kepler', links: externalAppLinks }}
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
