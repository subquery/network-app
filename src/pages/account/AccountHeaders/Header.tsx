// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { CurEra } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useAccount } from '@containers/Web3';
import { Typography } from '@subql/components';

import styles from './Headers.module.css';

export const AccountHeader: React.FC<{ profileAccount?: string }> = ({ profileAccount }) => {
  const { address } = useAccount();

  const account = useMemo(() => profileAccount || address, [profileAccount, address]);

  return (
    <div className={styles.header}>
      <div>
        <Typography type="secondary" variant="medium" style={{ marginBottom: 16 }}>
          {profileAccount ? 'Profile' : 'My Profile'}
        </Typography>
        {account && <ConnectedIndexer id={account} size="large"></ConnectedIndexer>}
      </div>
      <CurEra />
    </div>
  );
};
