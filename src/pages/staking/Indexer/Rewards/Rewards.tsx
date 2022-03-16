// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useRewards } from '../../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import {
  GetRewards_rewards_nodes as Reward,
  GetRewards_unclaimedRewards_nodes as UnclaimedReward,
} from '../../../../__generated__/GetRewards';
import ClaimRewards from './ClaimRewards';
import { Table as TableD, TableProps } from 'antd';

function isClaimedReward(reward: Reward | UnclaimedReward): reward is Reward {
  return !!(reward as Reward).claimedTime;
}

const Rewards: React.VFC<{ delegatorAddress: string }> = ({ delegatorAddress }) => {
  const rewards = useRewards({ address: delegatorAddress });
  const { t } = useTranslation('translation');

  const colums: TableProps<Reward | UnclaimedReward>['columns'] = [
    {
      title: '#',
      key: 'idx',
      width: 30,
      render: (t, r, index) => <Typography>{index + 1}</Typography>,
    },
    {
      title: t('rewards.header1').toUpperCase(),
      dataIndex: 'indexerAddress',
      key: 'indexer',
      width: 200,
      render: (t: string) => <Typography>{t}</Typography>,
    },
    {
      title: t('rewards.header2').toUpperCase(),
      dataIndex: 'amount',
      key: 'amount',
      width: 80,
      render: (amount: BigInt) => <Typography>{formatEther(BigNumber.from(amount))}</Typography>,
    },
    {
      title: t('rewards.header3').toUpperCase(),
      dataIndex: 'amount',
      key: 'action',
      width: 60,
      render: (t, reward: Reward | UnclaimedReward) =>
        isClaimedReward(reward) ? undefined : (
          <ClaimRewards indexer={reward.indexerAddress} amount={formatEther(BigNumber.from(reward.amount))} />
        ),
    },
  ];

  return renderAsyncArray(
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
      empty: () => <Typography>{t('rewards.none')}</Typography>,
      data: (data) => <TableD columns={colums} dataSource={data} scroll={{ x: 800 }} />,
    },
  );
};

export default Rewards;
