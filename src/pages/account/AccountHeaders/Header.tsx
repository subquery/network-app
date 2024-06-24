// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { CurEra } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useAccount } from '@containers/Web3';
import { useIsMobile } from '@hooks/useIsMobile';
import { Typography } from '@subql/components';

import styles from './Headers.module.css';

export const AccountHeader: React.FC<{ profileAccount?: string }> = ({ profileAccount }) => {
  const { address } = useAccount();
  const isMobile = useIsMobile();

  const account = useMemo(() => profileAccount || address, [profileAccount, address]);

  return (
    <div className={styles.header}>
      <div className={isMobile ? 'flex-between' : ''} style={{ width: '100%', alignItems: 'flex-start' }}>
        <Typography type="secondary" variant="medium" style={{ marginBottom: 16 }}>
          {profileAccount ? 'Profile' : 'My Profile'}
        </Typography>
        {!isMobile && account && <ConnectedIndexer id={account} size="large"></ConnectedIndexer>}
        {isMobile && <CurEra />}
      </div>
      {!isMobile && <CurEra />}
      {isMobile && account && (
        <div style={{ width: '100%' }}>
          <ConnectedIndexer id={account}></ConnectedIndexer>
        </div>
      )}
    </div>
  );
};
