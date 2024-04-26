// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { BsCheckCircleFill, BsLifePreserver } from 'react-icons/bs';
import { Typography } from '@subql/components';

import styles from './index.module.less';

const SwapSuccess: FC = () => {
  return (
    <div className={styles.swapSuccess}>
      <div className={styles.swapSuccessInner}>
        <BsCheckCircleFill style={{ color: 'var(--sq-success)', fontSize: 80 }} />
        <Typography variant="h5" weight={500}>
          Bridge successful
        </Typography>
        <Typography variant="medium" type="secondary" style={{ textAlign: 'center' }}>
          Your bridge successfully completed. You can view it on{' '}
          <Typography.Link type="info" href="https://basescan.org/">
            Basescan.
          </Typography.Link>{' '}
          and{' '}
          <Typography.Link type="info" href="https://etherscan.io/">
            Etherscan.
          </Typography.Link>
        </Typography>

        <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BsLifePreserver />
          Need help? please
          <Typography.Link type="info" href="https://discord.com/invite/subquery">
            contact us
          </Typography.Link>
        </Typography>
      </div>
    </div>
  );
};
export default SwapSuccess;
