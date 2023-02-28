// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Breadcrumb, Table, TableProps, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import { UnclaimedReward, Reward } from '@subql/network-query';
import { useGetRewardsQuery } from '@subql/react-hooks';
import { TableTitle } from '@subql/components';
import { useWeb3 } from '../../../containers';
import { formatEther, mapAsync, notEmpty, renderAsyncArray, ROUTES } from '../../../utils';
import ClaimRewards from './ClaimRewards';
import styles from './Rewards.module.css';
import { AppPageHeader, TableText } from '../../../components';
import { BigNumber } from 'ethers';
import { TokenAmount } from '../../../components/TokenAmount';

function isClaimedReward(reward: Reward | UnclaimedReward): reward is Reward {
  return !!(reward as Reward).claimedTime;
}

// TODO: Confirm with design team for component level
const RewardsSubRoutes = () => {
  const { t } = useTranslation('translation');
  return (
    <Breadcrumb separator=">">
      <Breadcrumb.Item href={ROUTES.MY_ACCOUNT_NAV} className={styles.title}>
        {t('indexer.indexers')}
      </Breadcrumb.Item>
      <Breadcrumb.Item className={styles.title}>{t('rewards.claim.title')}</Breadcrumb.Item>
    </Breadcrumb>
  );
};

export const Rewards: React.FC<{ delegator: string }> = ({ delegator }) => {
  const { account } = useWeb3();
  const rewards = useGetRewardsQuery({ variables: { address: delegator } });
  const { t } = useTranslation();

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
      <RewardsSubRoutes />
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
