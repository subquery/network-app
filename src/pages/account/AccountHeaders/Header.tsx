// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CurEra } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useWeb3 } from '@containers';
import { Typography } from '@subql/components';

import styles from './Headers.module.css';

export const AccountHeader: React.FC = () => {
  const { account } = useWeb3();

  return (
    <div className={styles.header}>
      <div>
        <Typography type="secondary" variant="medium" style={{ marginBottom: 16 }}>
          My Profile
        </Typography>
        {account && <ConnectedIndexer id={account} size="large"></ConnectedIndexer>}
      </div>
      <CurEra />
    </div>
  );
};
