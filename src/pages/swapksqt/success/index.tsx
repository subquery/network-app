// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useState } from 'react';
import { BsBoxArrowInUpRight, BsCheckCircleFill, BsLifePreserver } from 'react-icons/bs';
import { usePosClient } from '@hooks/usePosClient';
import { openNotification, Typography } from '@subql/components';
import { Button } from 'antd';
import { useAccount } from 'wagmi';

import styles from './index.module.less';

const SwapSuccess: FC = () => {
  const posClient = usePosClient();
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);

  const withdrawStart = async () => {
    try {
      setLoading(true);
      if (!address) return;
      const sqtErc20 = await posClient.posClient?.erc20(import.meta.env.VITE_SQT_TOKEN_ADDRESS);
      const amount = await sqtErc20?.getBalance(address);
      if (!amount) {
        openNotification({
          type: 'error',
          description: "Can't get balance, please make sure you have SQT tokens.",
        });
        return;
      }
      const res = await sqtErc20?.withdrawStart(amount);

      if (res) {
        openNotification({
          type: 'success',
          description: 'Withdraw started. You can check the status on https://wallet.polygon.technology/',
        });
      }
    } finally {
      setLoading(false);
    }
  };

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
          SubQuery launched on Base network, To move assets from the Polygon network to Base network, you’ll need to
          connect to a bridge to transfer your funds.
        </Typography>

        <Button
          loading={loading}
          onClick={withdrawStart}
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
          Bridge Tokens
          <BsBoxArrowInUpRight></BsBoxArrowInUpRight>
        </Button>
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
