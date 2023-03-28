// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Copy, CurEra } from '@components';
import { useWeb3 } from '@containers';
import { Typography } from '@subql/components';
import styles from './MyAccount.module.css';
import ReactJazzicon from 'react-jazzicon';
import { Link } from 'react-router-dom';
import { truncateAddress } from '@utils';

export const AccountHeader: React.FC = () => {
  const { account } = useWeb3();

  return (
    <div className={styles.header}>
      <div className={styles.accountContainer}>
        <div className={styles.icon}>
          <ReactJazzicon diameter={70} />
        </div>
        <div className={styles.account}>
          <Copy value={account ?? ''} iconClassName={styles.copyIcon}>
            <Typography variant="h5" weight={900}>
              {truncateAddress(account ?? '')}
            </Typography>
          </Copy>
          {/* <Typography variant="medium" className={styles.link}>
            <Link to={'/'}>{'Manage Controller Account'}</Link>
          </Typography> */}
        </div>
      </div>
      <CurEra />
    </div>
  );
};
