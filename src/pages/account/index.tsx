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
import { Footer, Spinner, Typography } from '@subql/components';
import { WithdrawalStatus } from '@subql/network-query';
import { renderAsync, useGetRewardsQuery, useGetWithdrawlsQuery } from '@subql/react-hooks';
import { formatEther, formatNumber, formatSQT, mergeAsync, TOKEN, truncFormatEtherStr } from '@utils';
import { Tabs } from 'antd';
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
    Object.keys(activeKeyLinks).map((key) => {
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
  }, []);

  return renderAsync(mergeAsync(delegating, sortedIndexer, rewards, withdrawals), {
    loading: () => <Spinner />,
    error: (e) => {
      console.error('e', e);
      return <Typography>{`Failed to load account details: ${e}`}</Typography>;
    },
    data: (data) => {
      const [d, i, r, w] = data;
      // const totalCount = idexerDelagation?.indexer?.delegations?.totalCount || 0;
      const totalDelegating = formatEther(d, 4);
      const totalRewards = reduceTotal([r?.rewards?.nodes, r?.unclaimedRewards?.nodes].flat());
      const totalWithdrawn = reduceTotal(w?.withdrawls?.nodes);
      const totalStaking = truncFormatEtherStr(`${i?.totalStake?.current ?? 0}`, 4);

      return (
        <div className="col-flex" style={{ width: '100%' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24, width: '100%' }}>
            <AccountHeader />

            <div className="flex">
              <NewCard
                style={{ marginRight: 24, minHeight: 426, minWidth: 304 }}
                title="Your Total Rewards"
                tooltip={t('account.tooltip.rewards')}
                titleExtra={BalanceLayout({
                  mainBalance: formatSQT(totalRewards),
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
                    link="/profile/withdrawls"
                  ></FormatCardLine>
                </div>
              </NewCard>
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
            <Footer simple></Footer>
          </div>
        </div>
      );
    },
  });
};

export default MyAccount;
