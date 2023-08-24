// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import { useNavigate } from 'react-router';
import NewCard from '@components/NewCard';
import { Footer, Tooltip, Typography } from '@subql/components';
import { useGetDashboardQuery } from '@subql/react-hooks';
import { parseError, renderAsync, TOKEN } from '@utils';
import { formatNumber, formatSQT, toPercentage } from '@utils/numberFormatters';
import { Skeleton } from 'antd';
import Link from 'antd/es/typography/Link';
import clsx from 'clsx';

import { ActiveCard } from './components/ActiveCard/ActiveCard';
import { EraCard } from './components/EraCard/EraCard';
import { ForumCard } from './components/ForumCard/ForumCard';
import { RewardsLineChart } from './components/RewardsLineChart/RewardsLineChart';
import { StakeAndDelegationLineChart } from './components/StakeAndDelegationLineChart/StakeAndDelegationLineChart';
import styles from './index.module.less';

export const BalanceLayout = ({
  mainBalance,
  secondaryBalance,
  secondaryTooltip = 'Estimated for next Era',
  token = TOKEN,
}: {
  mainBalance: number;
  secondaryBalance?: number;
  secondaryTooltip?: React.ReactNode;
  token?: string;
}) => {
  const secondaryRender = () => {
    if (!secondaryBalance)
      return (
        <Typography variant="small" type="secondary" style={{ visibility: 'hidden' }}>
          bigo
        </Typography>
      );
    return secondaryTooltip ? (
      <Tooltip title={secondaryTooltip} placement="topLeft">
        <Typography variant="small" type="secondary">
          {formatNumber(secondaryBalance)} {token}
        </Typography>
      </Tooltip>
    ) : (
      <Typography variant="small" type="secondary">
        {formatNumber(secondaryBalance)} {token}
      </Typography>
    );
  };

  return (
    <div className="col-flex">
      <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 16 }}>
        <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
          {formatNumber(mainBalance)}
        </Typography>
        {token}
      </div>
      {secondaryRender()}
    </div>
  );
};

const TotalRewardsCard = (props: {
  totalRewards: string | bigint;
  indexerRewards: string | bigint;
  delegationRewards: string | bigint;
}) => {
  return (
    <NewCard
      title="Total Network Rewards"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.totalRewards),
      })}
      tooltip="This is the total rewards that have been claimed or are able to be claimed across the entire network right now"
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Total Reward to Indexers
          </Typography>
          <Typography variant="small">
            {formatNumber(formatSQT(props.indexerRewards))} {TOKEN}
          </Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Total Reward to Delegation
          </Typography>
          <Typography variant="small">
            {formatNumber(formatSQT(props.delegationRewards))} {TOKEN}
          </Typography>
        </div>
      </div>
    </NewCard>
  );
};

const StakeCard = (props: { totalStake: string | bigint; nextTotalStake: string | bigint; totalCount: number }) => {
  const navigate = useNavigate();

  return (
    <NewCard
      title="Current Network Stake"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.totalStake),
        secondaryBalance: formatSQT(props.nextTotalStake),
      })}
      tooltip={`This is the total staked ${TOKEN} across the entire network right now. This includes ${TOKEN} that has been delegated to Indexers`}
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Number of Indexers
          </Typography>
          <Typography variant="small">{props.totalCount}</Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Link
            onClick={() => {
              navigate('/delegator/indexers/all');
            }}
          >
            View Indexers
          </Link>
        </div>
      </div>
    </NewCard>
  );
};

const DelegationsCard = (props: {
  delegatorStake: string | bigint;
  nextDelegatorStake: string | bigint;
  totalCount: number;
}) => {
  const navigate = useNavigate();

  return (
    <NewCard
      title="Current Network Delegation"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.delegatorStake),
        secondaryBalance: formatSQT(props.nextDelegatorStake),
      })}
      tooltip={`This is the total ${TOKEN} delegated by participants to any Indexer across the entire network right now`}
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Number of Delegators
          </Typography>
          <Typography variant="small">{props.totalCount}</Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Link
            onClick={() => {
              navigate('/delegator/indexers/top');
            }}
          >
            Delegate Now
          </Link>
        </div>
      </div>
    </NewCard>
  );
};

const CirculatingCard = (props: { circulatingSupply: string | bigint; totalStake: string | bigint }) => {
  return (
    <NewCard
      title="Circulating Supply"
      titleExtra={BalanceLayout({
        mainBalance: formatSQT(props.circulatingSupply),
      })}
      tooltip={`This is the total circulating supply of ${TOKEN} across the entire network right now`}
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Percentage Staked
          </Typography>
          <Typography variant="small">
            {toPercentage(formatSQT(props.totalStake), formatSQT(props.circulatingSupply))}
          </Typography>
        </div>
      </div>
    </NewCard>
  );
};

const Dashboard: FC = () => {
  const dashboardData = useGetDashboardQuery();

  return (
    <div className={styles.dashboard}>
      <Typography variant="h4" weight={600}>
        👋 Welcome to SubQuery Network
      </Typography>

      {renderAsync(dashboardData, {
        loading: () => <Skeleton active avatar paragraph={{ rows: 20 }} />,
        error: (e) => <Typography>{parseError(e)}</Typography>,
        data: (fetchedData) => {
          return (
            <div className={styles.dashboardMain}>
              <div className={styles.dashboardMainTop}>
                <TotalRewardsCard
                  totalRewards={fetchedData?.eraRewards?.aggregates?.sum?.amount || '0'}
                  indexerRewards={fetchedData?.rewardsToIndexer?.aggregates?.sum?.amount || '0'}
                  delegationRewards={fetchedData.rewardsToDelegation?.aggregates?.sum?.amount || '0'}
                ></TotalRewardsCard>
                <StakeCard
                  totalStake={fetchedData?.indexerStakeSummary?.totalStake || '0'}
                  nextTotalStake={fetchedData?.indexerStakeSummary?.nextTotalStake || '0'}
                  totalCount={fetchedData?.indexers?.totalCount || 0}
                ></StakeCard>

                <DelegationsCard
                  delegatorStake={fetchedData?.indexerStakeSummary?.delegatorStake || '0'}
                  nextDelegatorStake={fetchedData?.indexerStakeSummary?.nextDelegatorStake || '0'}
                  totalCount={fetchedData?.delegations?.totalCount || 0}
                ></DelegationsCard>

                <CirculatingCard
                  circulatingSupply={fetchedData?.sqtokens?.aggregates?.sum?.circulatingSupply || '0'}
                  totalStake={fetchedData?.indexerStakeSummary?.totalStake || '0'}
                ></CirculatingCard>
              </div>
              <div className={styles.dashboardMainBottom}>
                <div className={styles.dashboardMainBottomLeft}>
                  <StakeAndDelegationLineChart></StakeAndDelegationLineChart>

                  <div style={{ marginTop: 24 }}>
                    <RewardsLineChart></RewardsLineChart>
                  </div>
                </div>
                <div className={styles.dashboardMainBottomRight}>
                  <EraCard></EraCard>
                  <ActiveCard></ActiveCard>
                  <ForumCard></ForumCard>
                </div>
              </div>
            </div>
          );
        },
      })}
      <Footer simple />
    </div>
  );
};
export default Dashboard;
