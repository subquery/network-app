// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { matchPath, Outlet, useNavigate } from 'react-router';
import NewCard from '@components/NewCard';
import { useWeb3 } from '@containers';
import { useSortedIndexer } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { Footer, Typography } from '@subql/components';
import { WithdrawalStatus } from '@subql/network-query';
import { renderAsync, useGetRewardsQuery, useGetWithdrawlsQuery } from '@subql/react-hooks';
import { formatEther, formatNumber, mergeAsync, TOKEN, truncFormatEtherStr } from '@utils';
import { Skeleton, Tabs } from 'antd';
import Link from 'antd/es/typography/Link';
import { BigNumber } from 'ethers';
import { t } from 'i18next';

import { AccountHeader } from './AccountHeaders/Header';
import styles from './Account.module.less';

//TODO: add fragments so can better type this
function reduceTotal(rewards: any) {
  return formatEther(
    rewards?.reduce(
      (accumulator: any, currentValue: { amount: unknown }) =>
        accumulator.add(BigNumber.from(currentValue?.amount ?? 0)),
      BigNumber.from(0),
    ),
    4,
  );
}

const FormatCardLine: React.FC<{ title: string; amount: number | string; linkName: string; link: string }> = ({
  title,
  amount,
  linkName,
  link,
}) => {
  const navigate = useNavigate();

  return (
    <div className="col-flex" style={{ marginBottom: 12 }}>
      <div className="flex" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <Typography variant="small" type="secondary">
          {title}
        </Typography>
        <Typography variant="small">
          {amount} {TOKEN}
        </Typography>
      </div>
      <Link
        onClick={() => {
          navigate(link);
        }}
        style={{ fontSize: 12, color: 'var(--sq-blue600)' }}
      >
        {linkName}
      </Link>
    </div>
  );
};

const activeKeyLinks: {
  [key: string]: string;
} = {
  SD: '/profile/staking',
  Rewards: '/profile/rewards',
  Withdrawls: '/profile/withdrawn',
};

export const MyAccount: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const sortedIndexer = useSortedIndexer(account || '');
  const delegating = useDelegating(account ?? '');
  const rewards = useGetRewardsQuery({ variables: { address: account ?? '' } });
  const withdrawals = useGetWithdrawlsQuery({
    variables: { delegator: account ?? '', status: WithdrawalStatus.CLAIMED, offset: 0 },
  });

  const [activeKey, setActiveKey] = useState<'SD' | 'Rewards' | 'Withdrawls'>('SD');

  useEffect(() => {
    Object.keys(activeKeyLinks).forEach((key) => {
      if (
        matchPath(
          {
            path: activeKeyLinks[key],
          },
          window.location.pathname,
        )
      ) {
        setActiveKey(key as 'SD' | 'Rewards' | 'Withdrawls');
      }
    });
  }, [window.location.pathname]);
  return (
    <div
      className="col-flex"
      style={{ maxWidth: 1280, margin: '0 auto', padding: 24, width: '100%', height: 'calc(100vh - 90px)' }}
    >
      <AccountHeader />

      <div className="flex">
        {renderAsync(mergeAsync(delegating, sortedIndexer, rewards, withdrawals), {
          loading: () => (
            <Skeleton style={{ width: 304, marginRight: 24, flexShrink: 0 }} paragraph={{ rows: 9 }}></Skeleton>
          ),
          error: (e) => {
            console.error('e', e);
            return <Typography>{`Failed to load account details: ${e}`}</Typography>;
          },
          data: (data) => {
            const [d, i, r, w] = data;
            const totalDelegating = formatEther(d, 4);
            const totalRewards = reduceTotal([r?.rewards?.nodes, r?.unclaimedRewards?.nodes].flat());
            const totalWithdrawn = reduceTotal(w?.withdrawls?.nodes);
            const totalStaking = truncFormatEtherStr(`${i?.totalStake?.current ?? 0}`, 4);

            return (
              <NewCard
                style={{ marginRight: 24, minHeight: 426, minWidth: 304 }}
                title={
                  <Typography variant="large" weight={600}>
                    Your Total Rewards
                  </Typography>
                }
                tooltip={t('account.tooltip.rewards')}
                titleExtra={BalanceLayout({
                  mainBalance: +totalRewards,
                })}
              >
                <div className="col-flex">
                  <FormatCardLine
                    title="Unclaimed Rewards"
                    amount={formatNumber(reduceTotal(r?.unclaimedRewards?.nodes))}
                    linkName="Claim Rewards"
                    link="/profile/rewards"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total Delegation"
                    amount={formatNumber(totalDelegating)}
                    linkName="Delegate to an Indexer"
                    link="/delegator/indexers/top"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total Staking"
                    amount={formatNumber(totalStaking)}
                    linkName="Start Staking as an Indexer"
                    link="/indexer/my-staking"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total withdrawls"
                    amount={formatNumber(totalWithdrawn)}
                    linkName="View Withdrawls"
                    link="/profile/withdrawn"
                  ></FormatCardLine>
                </div>
              </NewCard>
            );
          },
        })}
        {account && (
          <div style={{ width: '100%' }}>
            <RewardsLineChart
              account={account}
              title="Rewards"
              dataDimensionsName={['Indexer Rewards', 'Delegator Rewards']}
            ></RewardsLineChart>
          </div>
        )}
      </div>
      <Tabs
        className={styles.tab}
        items={[
          { key: 'SD', label: 'Staking and Delegation' },
          { key: 'Rewards', label: 'Rewards' },
          { key: 'Withdrawls', label: 'Withdrawls' },
        ]}
        activeKey={activeKey}
        onTabClick={(key) => {
          setActiveKey(key as 'SD' | 'Rewards' | 'Withdrawls');
          navigate(activeKeyLinks[key]);
        }}
      ></Tabs>
      <Outlet></Outlet>
      <span style={{ flex: 1 }}></span>
      <Footer simple></Footer>
    </div>
  );
};

export default MyAccount;
