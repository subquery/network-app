// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { Card, Description, WalletRoute } from '@components';
import { Typography } from '@subql/components';
import { formatSQT, useAsyncMemo } from '@subql/react-hooks';
import { TOKEN } from '@utils';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';

import { useWeb3Store } from 'src/stores';

import styles from './index.module.less';

const MyAllocation: FC = (props) => {
  const { address: account } = useAccount();
  const { contracts } = useWeb3Store();

  const runnerAllocation = useAsyncMemo(async () => {
    if (!account)
      return {
        used: '0',
      };
    const res = await contracts?.stakingAllocation.runnerAllocation(account);

    return {
      used: formatSQT(res?.used.toString() || '0'),
    };
  }, [account]);

  return (
    <WalletRoute
      componentMode
      element={
        <div className={styles.myAllocation}>
          <Typography variant="h4" weight={600}>
            My Allocations
          </Typography>
          <Description desc={'Manage the staked allocations that you are allocating to different projects'} />

          <div style={{ marginTop: 24 }}>
            <Card
              title={'Total Allocations'}
              value={`${BigNumber(runnerAllocation.data?.used || '0').toFormat()} ${TOKEN}`}
            />
          </div>
        </div>
      }
    ></WalletRoute>
  );
};
export default MyAllocation;
