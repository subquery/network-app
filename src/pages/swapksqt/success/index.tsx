// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from 'react';
import { BsBoxArrowInUpRight, BsCheckCircleFill, BsLifePreserver } from 'react-icons/bs';
import { Typography } from '@subql/components';
import { Button } from 'antd';

import styles from './index.module.less';

const SwapSuccess: FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.swapSuccess}>
      <div className={styles.swapSuccessInner}>
        <BsCheckCircleFill style={{ color: 'var(--sq-success)', fontSize: 80 }} />
        <Typography variant="h5" weight={500}>
          Swap successful
        </Typography>
        <Typography variant="medium" type="secondary">
          Your swap successfully completed. You can view it on{' '}
          <Typography.Link active href="https://polygonscan.com/">
            Polygonscan.
          </Typography.Link>{' '}
        </Typography>
        <Typography variant="medium" type="secondary">
          SubQuery Mainnet has launched on Base network, To move assets from the Polygon network to Base network, you’ll
          need to connect to a bridge to transfer your funds. We recommend using official bridges like{' '}
          <Typography.Link active href="https://portal.polygon.technology/bridge">
            Polygon Portal
          </Typography.Link>
          . SubQuery can't be responsible for the use of any third party bridges
        </Typography>
        {Date.now() < 1710291600000 ? (
          <Typography variant="medium" type="secondary">
            SubQuery is providing a 100% rebate (a refund) of the gas fees that you incur bridging tokens from Polygon
            to Ethereum. This means that these bridge actions will cost you nothing.{' '}
            <Typography.Link active href="https://blog.subquery.network/subquery-network-bridge-gas-rebate-program">
              Read the terms and apply
            </Typography.Link>
            .
          </Typography>
        ) : null}
        <a
          href="https://portal.polygon.technology/"
          target="_blank"
          style={{ textDecoration: 'none' }}
          rel="noreferrer"
        >
          <Button
            loading={loading}
            type="primary"
            shape="round"
            size="large"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              justifyContent: 'center',
              padding: '16px 32px',
              height: '48px',
            }}
          >
            Bridge Tokens Now
            <BsBoxArrowInUpRight></BsBoxArrowInUpRight>
          </Button>
        </a>
        <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BsLifePreserver />
          Need help? please
          <Typography.Link active href="https://discord.com/invite/subquery">
            contact us
          </Typography.Link>
        </Typography>
      </div>
    </div>
  );
};
export default SwapSuccess;
