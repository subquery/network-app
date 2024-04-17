// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import NewCard from '@components/NewCard';
import { useEra } from '@hooks';
import { Footer, Tooltip, Typography } from '@subql/components';
import { renderAsync, useGetDashboardApyLazyQuery, useGetDashboardQuery } from '@subql/react-hooks';
import { numToHex, TOKEN } from '@utils';
import { formatNumber, formatSQT, toPercentage } from '@utils/numberFormatters';
import { Skeleton } from 'antd';
import Link from 'antd/es/typography/Link';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { cloneDeep } from 'lodash-es';

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
  mainBalance: number | string;
  secondaryBalance?: number | string;
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
            Total Reward to Operator
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
      tooltip={`This is the total staked ${TOKEN} across the entire network right now. This includes ${TOKEN} that has been delegated to Node Operators`}
      width={302}
    >
      <div className="col-flex">
        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Typography variant="small" type="secondary">
            Number of Node Operator
          </Typography>
          <Typography variant="small">{props.totalCount}</Typography>
        </div>

        <div className={clsx(styles.cardContentLine, 'flex-between')}>
          <Link
            onClick={() => {
              navigate('/delegator/indexers/all');
            }}
          >
            View Node Operators
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
      tooltip={`This is the total ${TOKEN} delegated by participants to any Node Operator across the entire network right now`}
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

const CirculatingCard = (props: { circulatingSupply: string; totalStake: string | bigint }) => {
  return (
    <NewCard
      title="Circulating Supply"
      titleExtra={BalanceLayout({
        mainBalance: props.circulatingSupply,
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
            {toPercentage(formatSQT(props.totalStake), BigNumber(props.circulatingSupply).toNumber())}
          </Typography>
        </div>
      </div>
    </NewCard>
  );
};

const ApyCard = () => {
  const { currentEra } = useEra();
  const [fetchLastestStakeAndRewards, latestStakeAndRewards] = useGetDashboardApyLazyQuery({
    variables: {
      currentEra: currentEra.data?.index || 0,
      currentEraIdx: currentEra.data?.index ? `${numToHex(currentEra.data.index - 1)}` : '0x00',
    },
  });

  const estimatedApy = useMemo(() => {
    if (!latestStakeAndRewards.data || !currentEra.data?.index)
      return {
        totalApy: '0',
        delegatorApy: '0',
        indexerApy: '0',
      };
    const makeApy = (rewards: string, stakes: string) => {
      return BigNumber(rewards)
        .dividedBy(stakes === '0' ? '1' : stakes)
        .dividedBy(7)
        .multipliedBy(365)
        .multipliedBy(100)
        .toFixed(2);
    };
    const sortFunc = (a: { keys: readonly string[] | null }, b: { keys: readonly string[] | null }) =>
      +(b?.keys?.[0] || 0) - +(a?.keys?.[0] || 0);
    const latestTotalRewards =
      [...(cloneDeep(latestStakeAndRewards.data?.eraRewards?.groupedAggregates) || [])]?.sort(sortFunc)?.[0]?.sum
        ?.amount || '0';
    const latestIndexerRewards =
      [...(cloneDeep(latestStakeAndRewards.data?.indexerEraReward?.groupedAggregates) || [])]?.sort(sortFunc)?.[0]?.sum
        ?.amount || '0';
    const latestDelegationRewards =
      [...(cloneDeep(latestStakeAndRewards.data?.delegationEraReward?.groupedAggregates) || [])].sort(sortFunc)?.[0]
        ?.sum?.amount || '0';

    const latestStakes = [...(cloneDeep(latestStakeAndRewards.data?.indexerStakes?.groupedAggregates) || [])]?.sort(
      sortFunc,
    );
    const latestTotalStake = latestStakes?.[0]?.sum?.totalStake || '0';
    const latestIndexerStake = latestStakes?.[0]?.sum?.indexerStake || '0';
    const latestDelegatorStake = latestStakes?.[0]?.sum?.delegatorStake || '0';

    return {
      totalApy: makeApy(latestTotalRewards.toString(), latestTotalStake.toString()),
      delegatorApy: makeApy(latestDelegationRewards.toString(), latestDelegatorStake.toString()),
      indexerApy: makeApy(latestIndexerRewards.toString(), latestIndexerStake.toString()),
    };
  }, [latestStakeAndRewards.data]);

  useEffect(() => {
    if (!currentEra.loading) {
      fetchLastestStakeAndRewards();
    }
  }, [currentEra.loading]);

  return renderAsync(
    { ...latestStakeAndRewards, loading: currentEra.loading || latestStakeAndRewards.loading },
    {
      loading: () => (
        <Skeleton
          active
          paragraph={{ rows: 4 }}
          style={{ display: 'flex', maxHeight: 176, width: 302, marginTop: 24, marginBottom: 40 }}
        />
      ),
      error: (e) => (
        <Skeleton
          active
          paragraph={{ rows: 4 }}
          style={{ display: 'flex', maxHeight: 176, width: 302, marginTop: 24, marginBottom: 40 }}
        />
      ),
      data: () => (
        <NewCard
          title="Estimated APY"
          titleExtra={
            <div className="col-flex">
              <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)' }}>
                {estimatedApy.totalApy || 0}%
              </Typography>
              <Typography variant="small" type="secondary" style={{ visibility: 'hidden' }}>
                bigo
              </Typography>
            </div>
          }
          tooltip={
            <div className="col-flex" style={{ gap: 24 }}>
              <Typography variant="small" style={{ color: '#fff' }}>
                We’ve calculated this estimated APY based on the statistics and returns from the previous era
              </Typography>
              <Typography variant="small" style={{ color: '#fff' }}>
                If conditions have changed, it will likely change considerable after the end of this Era.
              </Typography>
              <Typography variant="small" style={{ color: '#fff' }}>
                This APY assumes compounding returns each Era
              </Typography>
            </div>
          }
          width={302}
        >
          <div className="col-flex">
            <div className={clsx(styles.cardContentLine, 'flex-between')}>
              <Typography variant="small" type="secondary">
                Estimated APY for Node Operators
              </Typography>
              <Typography variant="small">{estimatedApy.indexerApy || 0} %</Typography>
            </div>

            <div className={clsx(styles.cardContentLine, 'flex-between')}>
              <Typography variant="small" type="secondary">
                Estimated APY for Delegators
              </Typography>
              <Typography variant="small">{estimatedApy.delegatorApy || 0} %</Typography>
            </div>
          </div>
        </NewCard>
      ),
    },
  );
};

const Dashboard: FC = () => {
  const dashboardData = useGetDashboardQuery();
  const { currentEra } = useEra();

  const [circleAmount, setCircleAmount] = useState('0');

  const showNextOrCur = useMemo(() => {
    if (dashboardData.data?.indexerStakeSummary?.eraIdx === currentEra.data?.index) {
      return 'cur';
    }

    return 'next';
  }, [currentEra.data, dashboardData]);

  const fetchCircleAmount = async () => {
    const res = await fetch('https://sqt.subquery.foundation/circulating');
    const data: string = await res.text();

    if (!BigNumber(data).isNaN()) {
      setCircleAmount(BigNumber(data).toString());
    }
  };

  useEffect(() => {
    fetchCircleAmount();
  }, []);

  return (
    <div className={styles.dashboard}>
      <Typography variant="h4" weight={600}>
        👋 Welcome to SubQuery Network
      </Typography>

      <ActiveCard></ActiveCard>

      {renderAsync(dashboardData, {
        loading: () => <Skeleton active avatar paragraph={{ rows: 20 }} />,
        error: (e) => <Skeleton active avatar paragraph={{ rows: 20 }} />,
        data: (fetchedData) => {
          const delegatorsTotalCount =
            +(fetchedData?.delegations?.aggregates?.distinctCount?.delegatorId?.toString() || 0) -
            (fetchedData.indexers?.totalCount || 0);

          const totalStake =
            showNextOrCur === 'cur'
              ? fetchedData.indexerStakeSummary?.totalStake
              : fetchedData.indexerStakeSummary?.nextTotalStake;

          const totalDelegation =
            showNextOrCur === 'cur'
              ? fetchedData.indexerStakeSummary?.delegatorStake
              : fetchedData.indexerStakeSummary?.nextDelegatorStake;

          return (
            <div className={styles.dashboardMain}>
              <div className={styles.dashboardMainTop}>
                <ApyCard></ApyCard>
                <TotalRewardsCard
                  totalRewards={fetchedData?.indexerRewards?.aggregates?.sum?.amount || '0'}
                  indexerRewards={fetchedData?.rewardsToIndexer?.aggregates?.sum?.amount || '0'}
                  delegationRewards={fetchedData.rewardsToDelegation?.aggregates?.sum?.amount || '0'}
                ></TotalRewardsCard>

                <StakeCard
                  totalStake={totalStake || '0'}
                  nextTotalStake={fetchedData?.indexerStakeSummary?.nextTotalStake || '0'}
                  totalCount={fetchedData?.indexers?.totalCount || 0}
                ></StakeCard>

                <DelegationsCard
                  delegatorStake={totalDelegation || '0'}
                  nextDelegatorStake={fetchedData?.indexerStakeSummary?.nextDelegatorStake || '0'}
                  totalCount={delegatorsTotalCount < 0 ? 0 : delegatorsTotalCount}
                ></DelegationsCard>
              </div>
              <div className={styles.dashboardMainBottom}>
                <div className={styles.dashboardMainBottomLeft}>
                  <StakeAndDelegationLineChart></StakeAndDelegationLineChart>

                  <div style={{ marginTop: 24 }}>
                    <RewardsLineChart></RewardsLineChart>
                  </div>
                </div>
                <div className={styles.dashboardMainBottomRight}>
                  <CirculatingCard
                    circulatingSupply={circleAmount || '0'}
                    totalStake={totalStake || '0'}
                  ></CirculatingCard>
                  <EraCard></EraCard>
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
