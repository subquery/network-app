// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { APYTooltip } from '@components/APYTooltip';
import { useEra } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { FormatCardLine } from '@pages/account';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { SubqlCard, Typography } from '@subql/components';
import {
  useGetDelegatorApiesQuery,
  useGetDelegatorTotalRewardsQuery,
  useGetTotalDelegationWithdrawlsQuery,
  useGetTotalRewardsAndUnclaimRewardsQuery,
} from '@subql/react-hooks';
import { formatEther } from '@utils';
import { formatNumber } from '@utils';
import { Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';
import { t } from 'i18next';

import { formatSQT } from '../../utils/numberFormatters';
import styles from './MyDelegation.module.css';

export function DelegatingCard({
  account = '',
  delegationList,
}: {
  account?: string;
  delegationList: {
    apy: string | bigint;
    lastDelegationEra: number;
  }[];
}) {
  const { currentEra } = useEra();
  const delegating = useDelegating(account);
  const delegatorApy = useGetDelegatorApiesQuery({
    variables: {
      delegator: account,
      era: currentEra.data?.index ? currentEra.data?.index - 1 : 0,
    },
  });

  const totalDelegatorRewards = useGetDelegatorTotalRewardsQuery({
    variables: {
      delegatorId: account,
    },
  });

  const rewards = useGetTotalRewardsAndUnclaimRewardsQuery({
    variables: {
      account: account,
    },
  });

  const totalWithdrawls = useGetTotalDelegationWithdrawlsQuery({
    variables: {
      delegator: account,
    },
  });

  const apy = React.useMemo(() => {
    const estimated = delegationList.every((i) => {
      const receiveRewardsEra = (i.lastDelegationEra || 0) + 2;
      return (currentEra.data?.index || 0) < receiveRewardsEra;
    });

    if (estimated)
      return (
        <Tooltip title={t('rewards.receiveRewardsInfo')}>
          <Typography>-</Typography>
        </Tooltip>
      );

    const realApy = (
      <Typography variant="small">
        {BigNumberJs(formatEther(delegatorApy.data?.eraDelegatorApies?.nodes?.[0]?.apy ?? '0'))
          .multipliedBy(100)
          .toFixed(2)}{' '}
        %
      </Typography>
    );

    return realApy;
  }, [delegatorApy.data?.eraDelegatorApies, delegationList]);

  return (
    <div className={`flex ${styles.delegationInfo}`}>
      <SubqlCard
        className={styles.newCard}
        title="Current Delegation"
        tooltip="The total amount that you have delegated to Node Operators"
        titleExtra={BalanceLayout({
          mainBalance: formatSQT(delegating.data?.curEra?.toString() ?? '0'),
          secondaryBalance: formatSQT(delegating.data?.nextEra.toString() ?? '0'),
        })}
      >
        <div className="col-flex">
          <div className="flex" style={{ marginBottom: 12 }}>
            <Typography variant="small" type="secondary" className="flex-center">
              Current Estimated APY
              <APYTooltip
                currentEra={currentEra?.data?.index}
                calculationDescription={
                  'This is estimated from your total rewards from delegation in the previous three Eras'
                }
              />
            </Typography>
            <span style={{ flex: 1 }}></span>
            {apy}
          </div>
          <FormatCardLine
            title="Total Delegation Rewards"
            amount={formatNumber(formatSQT(totalDelegatorRewards.data?.eraRewards?.aggregates?.sum?.amount ?? '0'))}
          ></FormatCardLine>
          <FormatCardLine
            title="Unclaimed Rewards"
            amount={formatNumber(formatSQT(rewards.data?.unclaimTotalRewards?.aggregates?.sum?.amount ?? '0'))}
            link="/profile/rewards"
            linkName="Claim Rewards"
          ></FormatCardLine>

          <FormatCardLine
            title="Total Delegation Withdrawals"
            amount={formatNumber(formatSQT(totalWithdrawls.data?.withdrawls?.aggregates?.sum?.amount ?? '0'))}
            link="/profile/withdrawn"
            linkName="View Withdrawals"
          ></FormatCardLine>
        </div>
      </SubqlCard>

      {
        <div className={`col-flex ${styles.rewardsLineChart}`}>
          <RewardsLineChart
            account={account}
            title="My Delegation Rewards"
            beDelegator
            onlyDelegator
            chartsStyle={{
              height: 340,
            }}
            skeletonHeight={340}
          ></RewardsLineChart>
        </div>
      }
    </div>
  );
}
