// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CurEra } from '@components';
import { ConnectedIndexer } from '@components/IndexerDetails/IndexerName';
import { useWeb3 } from '@containers';

import styles from './MyAccount.module.css';

export const AccountHeader: React.FC = () => {
  const { account } = useWeb3();

  return (
    <div className={styles.header}>
      <ConnectedIndexer id={account || ''} account={account} size="large"></ConnectedIndexer>
      <CurEra />
    </div>
  );
};
