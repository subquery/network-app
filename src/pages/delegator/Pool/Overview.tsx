// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3 } from '@containers';
import { FormatCardLine } from '@pages/account';
import { BalanceLayout } from '@pages/dashboard';
import { SubqlCard, Typography } from '@subql/components';
import { formatSQT, renderAsync, useAsyncMemo } from '@subql/react-hooks';
import clsx from 'clsx';

import { DelegationPool } from './contracts/delegationPool';
import styles from './Overview.module.css';

type Props = {
  poolSize: bigint;
  yourStake: bigint;
  apy: string;
  commission: string;
  totalRewards: bigint;
  yourRewards: bigint;
  pendingDelegation: bigint;
  pendingUndelegation: bigint;
};

export function ConnectedPoolOverview({ delegationPool }: { delegationPool?: DelegationPool }) {
  const { account } = useWeb3();

  const poolInfo = useAsyncMemo(async () => {
    if (!delegationPool) {
      return undefined;
    }

    const [totalAssets, fee, balance, pendingDelegation, pendingUndelegation] = await Promise.all([
      delegationPool.getTotalAssets(),
      delegationPool.feePerMill(),
      delegationPool.balanceOf(account ?? ''),
      delegationPool.availableAssets(),
      delegationPool.pendingUndelegationsForUsers(),
    ]);

    return {
      poolSize: totalAssets.toBigInt(),
      yourStake: balance.toBigInt(),
      apy: '0%', // TODO
      commission: `${(fee.toNumber() / 10_000).toFixed(2)}%`,
      totalRewards: 0n, // TODO
      yourRewards: 0n, // TODO
      pendingDelegation: pendingDelegation.toBigInt(),
      pendingUndelegation: pendingUndelegation.toBigInt(),
    };
  }, [delegationPool, account]);

  return renderAsync(poolInfo, {
    error: () => <div>Error loading pool overview.</div>,
    loading: () => <div>Loading pool overview...</div>,
    data: (poolData) => <PoolOverview {...poolData} />,
  });
}

export function PoolOverview(props: Props) {
  return (
    <div className={`flex ${styles.cardInfos}`}>
      <SubqlCard
        className={styles.cardDetails}
        title="Pool Size"
        tooltip="The amount of SQT delegated to the pool"
        titleExtra={BalanceLayout({
          mainBalance: formatSQT(props.poolSize),
        })}
        width={302}
      >
        <FormatCardLine title="Your Stake" amount={formatSQT(props.yourStake)} />
        <FormatCardLine title="Avalable to delegate" amount={formatSQT(props.pendingDelegation)} />
        <FormatCardLine title="Pending undelegation" amount={formatSQT(props.pendingUndelegation)} />
      </SubqlCard>

      <SubqlCard
        className={styles.cardDetails}
        title="Returns"
        titleExtra={BalanceLayout({
          mainBalance: props.apy,
          token: 'APY',
        })}
        width={302}
      >
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Commission
          </Typography>
          <Typography variant="small">{props.commission}</Typography>
        </div>
      </SubqlCard>

      <SubqlCard
        className={styles.cardDetails}
        title="Rewards"
        tooltip="The total rewards earned by the pool"
        titleExtra={BalanceLayout({
          mainBalance: formatSQT(props.totalRewards),
        })}
        width={302}
      >
        <FormatCardLine title="Your Rewards" amount={formatSQT(props.yourRewards)} />
      </SubqlCard>
    </div>
  );
}
