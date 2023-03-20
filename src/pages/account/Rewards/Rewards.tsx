// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { useWeb3 } from '@containers';
import { formatEther, mapAsync, notEmpty, renderAsyncArray, ROUTES } from '@utils';
import { RewardFieldsFragment as Reward, UnclaimedRewardFieldsFragment as UnclaimedReward } from '@subql/network-query';
import ClaimRewards from './ClaimRewards';
import styles from './Rewards.module.css';
import { AppPageHeader, TableText } from '../../../components';
import { BigNumber } from 'ethers';
import { TokenAmount } from '../../../components/TokenAmount';
import { useGetRewardsQuery } from '@subql/react-hooks';
import { TableTitle } from '@subql/components';
import { BreadcrumbNav } from '@components';
import { SUB_REWARDS } from '@containers/IndexerRegistryProjectSub';

function isClaimedReward(reward: Reward | UnclaimedReward): reward is Reward {
  return !!(reward as Reward).claimedTime;
}

export const Rewards: React.FC<{ delegator: string }> = ({ delegator }) => {
  const { account } = useWeb3();
  const filterParams = { address: delegator };
  const rewards = useGetRewardsQuery({ variables: filterParams });
  const { t } = useTranslation();

  rewards.subscribeToMore({
    document: SUB_REWARDS,
    variables: filterParams,
    updateQuery: (prev, { subscriptionData }) => {
      if (subscriptionData.data) {
        rewards.refetch();
      }
      return prev;
    },
  });

  const columns: TableProps<Reward | UnclaimedReward>['columns'] = [
    {
      title: '#',
      key: 'idx',
      render: (t, r, index) => <TableText content={index + 1} />,
    },
    {
      title: <TableTitle title={t('rewards.indexer')} />,
      dataIndex: 'indexerAddress',
      key: 'indexer',
      render: (text: string) => <TableText content={text} />,
    },
    {
      title: <TableTitle title={t('rewards.amount')} />,
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: bigint) => <TokenAmount value={formatEther(amount)} />,
    },
    {
      title: <TableTitle title={t('rewards.action')} />,
      dataIndex: 'action',
      key: 'action',
      render: (_, reward: Reward | UnclaimedReward) => {
        const hasClaimed = isClaimedReward(reward);
        const tagColor = hasClaimed ? 'green' : 'blue';
        return <Tag color={tagColor}>{hasClaimed ? t('rewards.claimed') : t('rewards.unclaimed')}</Tag>;
      },
    },
  ];

  return (
    <div className={styles.rewardsContainer}>
      <BreadcrumbNav
        backLink={`${ROUTES.MY_ACCOUNT_NAV}`}
        backLinkText={t('indexer.indexers')}
        childText={t('rewards.claim.title')}
      />
      <AppPageHeader title={t('rewards.claim.title')} desc={t('rewards.description')} />

      <div className={styles.rewardsList}>
        {renderAsyncArray(
          mapAsync(
            (data) =>
              ((data.unclaimedRewards?.nodes.filter(notEmpty) as Array<UnclaimedReward | Reward>) ?? []).concat(
                (data.rewards?.nodes.filter(notEmpty) as Array<Reward>) ?? [],
              ),
            rewards,
          ),
          {
            error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
            loading: () => <Spinner />,
            empty: () => <Typography variant="h6">{t('rewards.none')}</Typography>,
            data: (data) => {
              const totalUnclaimedRewards = rewards?.data?.unclaimedRewards?.totalCount || 0;
              const unclaimedRewards = rewards?.data?.unclaimedRewards?.nodes?.reduce(
                (result, unclaimedReward) => {
                  const totalUnclaimed = result.totalAmount.add(BigNumber.from(unclaimedReward?.amount ?? '0'));
                  const sortedIndexers = [...result.indexers, unclaimedReward?.indexerAddress];
                  return { indexers: sortedIndexers, totalAmount: totalUnclaimed };
                },
                {
                  indexers: [] as Array<string | undefined>,
                  totalAmount: BigNumber.from('0'),
                },
              );
              return (
                <>
                  <div className="flex-between">
                    <Typography variant="h6" className={styles.header}>
                      {t('rewards.totalUnclaimReward', { count: totalUnclaimedRewards })}
                    </Typography>
                    {totalUnclaimedRewards > 0 && unclaimedRewards?.indexers && (
                      <ClaimRewards
                        indexers={unclaimedRewards?.indexers as string[]}
                        account={account ?? ''}
                        totalUnclaimed={formatEther(unclaimedRewards?.totalAmount)}
                      />
                    )}
                  </div>
                  <Table columns={columns} dataSource={data} scroll={{ x: 600 }} rowKey="id" />
                </>
              );
            },
          },
        )}
      </div>
    </div>
  );
};
