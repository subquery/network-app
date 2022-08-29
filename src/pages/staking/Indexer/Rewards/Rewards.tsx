// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { useRewards, useWeb3 } from '../../../../containers';
import { formatEther, mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import {
  GetRewards_rewards_nodes as Reward,
  GetRewards_unclaimedRewards_nodes as UnclaimedReward,
} from '../../../../__generated__/registry/GetRewards';
import ClaimRewards from './ClaimRewards';
import styles from './Rewards.module.css';
import { TableText } from '../../../../components';

function isClaimedReward(reward: Reward | UnclaimedReward): reward is Reward {
  return !!(reward as Reward).claimedTime;
}

const Rewards: React.VFC<{ delegatorAddress: string }> = ({ delegatorAddress }) => {
  const { account } = useWeb3();
  const rewards = useRewards({ address: delegatorAddress });
  const { t } = useTranslation('translation');

  const columns: TableProps<Reward | UnclaimedReward>['columns'] = [
    {
      title: '#',
      key: 'idx',
      render: (t, r, index) => <TableText content={index + 1} />,
    },
    {
      title: t('rewards.header1').toUpperCase(),
      dataIndex: 'indexerAddress',
      key: 'indexer',
      render: (text: string) => <TableText content={text} />,
    },
    {
      title: t('rewards.header2').toUpperCase(),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: BigInt) => <TableText content={`${formatEther(amount)} SQT`} />,
    },
    {
      title: t('rewards.header3').toUpperCase(),
      dataIndex: 'amount',
      key: 'action',
      render: (_, reward: Reward | UnclaimedReward) => (
        <TableText
          content={isClaimedReward(reward) ? t('rewards.claimed') : t('rewards.unClaimed')}
          className={isClaimedReward(reward) ? 'grayText' : styles.unClaimedText}
        />
      ),
    },
  ];

  return (
    <div className={'contentContainer'}>
      {renderAsyncArray(
        mapAsync(
          (data) =>
            ((data.unclaimedRewards?.nodes.filter(notEmpty) as Array<UnclaimedReward | Reward>) ?? []).concat(
              data.rewards?.nodes.filter(notEmpty) ?? [],
            ),
          rewards,
        ),
        {
          error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
          loading: () => <Spinner />,
          empty: () => <Typography variant="h6">{t('rewards.none')}</Typography>,
          data: (data) => {
            const totalUnclaimedRewards = rewards?.data?.unclaimedRewards?.totalCount || 0;
            const unclaimedRewardsFromIndexers = rewards?.data?.unclaimedRewards?.nodes?.map(
              (unclaimedRewards) => unclaimedRewards?.indexerAddress ?? '',
            );
            return (
              <>
                <div className="flex-between">
                  <Typography variant="h6" className={styles.header}>
                    {t('rewards.totalUnclaimReward', { count: totalUnclaimedRewards })}
                  </Typography>
                  {totalUnclaimedRewards && unclaimedRewardsFromIndexers && (
                    <ClaimRewards indexers={unclaimedRewardsFromIndexers} account={account ?? ''} />
                  )}
                </div>
                <Table columns={columns} dataSource={data} scroll={{ x: 600 }} rowKey="id" />
              </>
            );
          },
        },
      )}
    </div>
  );
};

export default Rewards;
