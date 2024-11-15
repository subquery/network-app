// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import { matchPath, Outlet, useNavigate, useParams } from 'react-router';
import { APYTooltip } from '@components/APYTooltip';
import Expand from '@components/Expand/Expand';
import RpcError from '@components/RpcError';
import { WalletRoute } from '@components/WalletRoute';
import { useAccount } from '@containers/Web3';
import { useAsyncMemo, useEra, useIndexerMetadata, useIsIndexer, useSortedIndexer } from '@hooks';
import { useDelegating } from '@hooks/useDelegating';
import { BalanceLayout } from '@pages/dashboard';
import { RewardsLineChart } from '@pages/dashboard/components/RewardsLineChart/RewardsLineChart';
import { Footer, Markdown, SubqlCard, Typography } from '@subql/components';
import { WithdrawalStatus } from '@subql/network-query';
import {
  formatSQT,
  renderAsync,
  useGetAllIndexerByApyLazyQuery,
  useGetDelegatorApiesLazyQuery,
  useGetTotalRewardsAndUnclaimRewardsQuery,
  useGetWithdrawlsQuery,
} from '@subql/react-hooks';
import { formatEther, formatNumber, isRPCError, mergeAsync, notEmpty, TOKEN, truncFormatEtherStr } from '@utils';
import { Skeleton, Tabs } from 'antd';
import Link from 'antd/es/typography/Link';
import BigNumberJs from 'bignumber.js';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { BigNumber } from 'ethers';
import { t } from 'i18next';

import { AccountHeader } from './AccountHeaders/Header';
import styles from './Account.module.less';

function reduceTotal(rewards: { amount: bigint }[]) {
  return formatEther(
    rewards?.reduce(
      (accumulator: BigNumber, currentValue: { amount: bigint }) =>
        accumulator.add(BigNumber.from(currentValue?.amount ?? 0)),
      BigNumber.from(0),
    ),
    4,
  );
}

export const FormatCardLine: React.FC<{ title: string; amount: number | string; linkName?: string; link?: string }> = ({
  title,
  amount,
  linkName,
  link,
}) => {
  const navigate = useNavigate();

  return (
    <div className="col-flex" style={{ marginBottom: 12 }}>
      <div className="flex" style={{ justifyContent: 'space-between', marginBottom: link ? 8 : '' }}>
        <Typography variant="small" type="secondary">
          {title}
        </Typography>
        <Typography variant="small">
          {amount} {TOKEN}
        </Typography>
      </div>
      <Link
        onClick={() => {
          navigate(link || '');
        }}
        style={{ fontSize: 12, color: 'var(--sq-blue600)' }}
      >
        {linkName}
      </Link>
    </div>
  );
};

const activeKeyLinks: {
  [key: string]: string | string[];
} = {
  SD: ['/profile/staking', '/profile'],
  Rewards: '/profile/rewards',
  Withdrawals: '/profile/withdrawn',
};

export const MyAccountInner: React.FC = () => {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { currentEra } = useEra();
  const { id: profileAccount } = useParams();
  const account = useMemo(() => toChecksumAddress(profileAccount || address || ''), [address, profileAccount]);

  const isIndexer = useIsIndexer(account);
  const { indexerMetadata } = useIndexerMetadata(account || '');
  const sortedIndexer = useSortedIndexer(account || '');
  const delegating = useDelegating(account ?? '');
  const rewards = useGetTotalRewardsAndUnclaimRewardsQuery({
    variables: {
      account: account || '',
    },
  });
  const withdrawals = useGetWithdrawlsQuery({
    variables: { delegator: account ?? '', status: WithdrawalStatus.ONGOING, offset: 0 },
  });
  const [fetchIndexerApy] = useGetAllIndexerByApyLazyQuery();

  const [fetchDelegatorApy] = useGetDelegatorApiesLazyQuery();

  const [activeKey, setActiveKey] = useState<'SD' | 'Rewards' | 'Withdrawals'>('SD');

  const myAccountAPY = useAsyncMemo(async () => {
    if (isIndexer.data) {
      const apy = await fetchIndexerApy({
        variables: {
          first: 1,
          filter: {
            indexerId: { equalTo: account },
          },
        },
      });
      if (apy.data?.indexerApySummaries?.nodes.length) {
        return BigNumberJs(formatEther(apy.data.indexerApySummaries.nodes[0]?.indexerApy)).multipliedBy(100).toFixed(2);
      }
    }

    const apy = await fetchDelegatorApy({
      variables: {
        delegator: account,
        era: (currentEra.data?.index || 0) - 1,
      },
    });

    if (apy.data?.eraDelegatorApies?.nodes.length) {
      return BigNumberJs(formatEther(apy.data.eraDelegatorApies.nodes[0]?.apy)).multipliedBy(100).toFixed(2);
    }

    return '0';
  }, [isIndexer.data, currentEra.data, account]);

  useEffect(() => {
    Object.keys(activeKeyLinks).forEach((key) => {
      if (Array.isArray(activeKeyLinks[key])) {
        (activeKeyLinks[key] as string[]).forEach((path) => {
          if (
            matchPath(
              {
                path,
              },
              window.location.pathname,
            )
          ) {
            setActiveKey(key as 'SD' | 'Rewards' | 'Withdrawals');
          }
        });
      } else {
        if (
          matchPath(
            {
              path: activeKeyLinks[key] as string,
            },
            window.location.pathname,
          )
        ) {
          setActiveKey(key as 'SD' | 'Rewards' | 'Withdrawals');
        }
      }
    });
  }, [window.location.pathname]);

  return (
    <div
      className="col-flex"
      style={{ maxWidth: 1280, margin: '0 auto', padding: 24, width: '100%', height: 'calc(100vh - 90px)' }}
    >
      <AccountHeader profileAccount={account} />
      <div
        style={{
          margin: '24px 0',
          border: '1px solid var(--card-boder, rgba(223, 227, 232, 0.6))',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <Expand height={254}>
          <Typography variant="large" weight={600}>
            About the {indexerMetadata?.name || account}
          </Typography>

          <Markdown.Preview>
            {indexerMetadata?.description ||
              `${indexerMetadata?.name || account} has not provided any information about themselves`}
          </Markdown.Preview>
        </Expand>
      </div>
      <div className={`flex ${styles.dashboard}`}>
        {renderAsync(mergeAsync(delegating, sortedIndexer, rewards, withdrawals), {
          loading: () => (
            <Skeleton style={{ width: 304, marginRight: 24, flexShrink: 0 }} paragraph={{ rows: 9 }}></Skeleton>
          ),
          error: (e) => {
            if (isRPCError(e)) {
              return (
                <RpcError
                  size="small"
                  tryAgain={() => {
                    delegating.refetch();
                    sortedIndexer?.refresh?.();
                    rewards.refetch();
                    withdrawals.refetch();
                  }}
                ></RpcError>
              );
            }
            return <Typography>{`Failed to load account details: ${e}`}</Typography>;
          },
          data: (data) => {
            const [d, i, r, w] = data;
            const totalDelegating = formatEther(d?.nextEra, 4);
            const totalRewards = formatSQT(r?.totalRewards?.aggregates?.sum?.amount ?? '0');
            const totalWithdrawn = reduceTotal(w?.withdrawls?.nodes.filter(notEmpty) || []);
            const totalStaking = truncFormatEtherStr(`${i?.totalStake?.current ?? 0}`, 4);

            return (
              <SubqlCard
                className={styles.totalRewardsCard}
                title={
                  <Typography variant="large" weight={600}>
                    {profileAccount ? 'Total Rewards' : 'Your Total Rewards'}
                  </Typography>
                }
                tooltip={t('account.tooltip.rewards')}
                titleExtra={
                  <div className="col-flex">
                    {BalanceLayout({
                      mainBalance: +totalRewards,
                    })}

                    <Typography variant="small">
                      Estimated APY: {myAccountAPY.data?.toString()}%
                      <APYTooltip
                        currentEra={currentEra?.data?.index}
                        calculationDescription={
                          'This is estimated from your total rewards from last Era divided by your total stake and delegation'
                        }
                      />
                    </Typography>
                  </div>
                }
              >
                <div className="col-flex">
                  <FormatCardLine
                    title="Unclaimed Rewards"
                    amount={formatNumber(formatSQT(r?.unclaimTotalRewards?.aggregates?.sum?.amount ?? '0'))}
                    linkName="Claim Rewards"
                    link="/profile/rewards"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total Delegation"
                    amount={formatNumber(totalDelegating)}
                    linkName="Delegate to a Node Operator"
                    link="/delegator/indexers/top"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total Staking"
                    amount={formatNumber(totalStaking)}
                    linkName="Start Staking as a Node Operator"
                    link="/indexer/my-staking"
                  ></FormatCardLine>
                  <FormatCardLine
                    title="Total withdrawals"
                    amount={formatNumber(totalWithdrawn)}
                    linkName="View Withdrawals"
                    link="/profile/withdrawn"
                  ></FormatCardLine>
                </div>
              </SubqlCard>
            );
          },
        })}
        {account && (
          <div style={{ width: '100%' }}>
            <RewardsLineChart
              account={account}
              title="Rewards"
              dataDimensionsName={['Node Operator Rewards', 'Delegator Rewards']}
              beDelegator
            ></RewardsLineChart>
          </div>
        )}
      </div>
      {!profileAccount ? (
        <Tabs
          className={styles.tab}
          items={[
            { key: 'SD', label: 'Staking and Delegation' },
            { key: 'Rewards', label: 'Rewards' },
            { key: 'Withdrawals', label: 'Withdrawals' },
          ]}
          activeKey={activeKey}
          onTabClick={(key) => {
            setActiveKey(key as 'SD' | 'Rewards' | 'Withdrawals');
            navigate(Array.isArray(activeKeyLinks[key]) ? activeKeyLinks[key][0] : (activeKeyLinks[key] as string));
          }}
        ></Tabs>
      ) : (
        ''
      )}
      <Outlet></Outlet>
      <span style={{ flex: 1 }}></span>
      <Footer simple></Footer>
    </div>
  );
};

export const MyAccount = () => {
  return <WalletRoute componentMode element={<MyAccountInner></MyAccountInner>}></WalletRoute>;
};

export default MyAccount;
