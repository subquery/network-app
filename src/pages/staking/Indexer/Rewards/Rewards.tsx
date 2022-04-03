// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Spinner, Typography } from '@subql/react-ui';
import * as React from 'react';
import { Table, TableProps } from 'antd';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useRewards } from '../../../../containers';
import { formatEther, mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import {
  GetRewards_rewards_nodes as Reward,
  GetRewards_unclaimedRewards_nodes as UnclaimedReward,
} from '../../../../__generated__/GetRewards';
import ClaimRewards from './ClaimRewards';
import styles from './Rewards.module.css';

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
      align: 'center',
      render: (t, r, index) => <Typography className={clsx('blackText', styles.text)}>{index + 1}</Typography>,
    },
    {
      title: t('rewards.header1').toUpperCase(),
      dataIndex: 'indexerAddress',
      key: 'indexer',
      width: 160,
      align: 'center',
      render: (t: string) => <Typography className={clsx('blackText', styles.text)}>{t}</Typography>,
    },
    {
      title: t('rewards.header2').toUpperCase(),
      dataIndex: 'amount',
      key: 'amount',
      width: 50,
      render: (amount: BigInt) => (
        <Typography className={clsx('blackText', styles.text)}>{`${formatEther(amount)} SQT`}</Typography>
      ),
    },
    {
      title: t('rewards.header3').toUpperCase(),
      dataIndex: 'amount',
      key: 'action',
      width: 50,
      render: (t, reward: Reward | UnclaimedReward) =>
        isClaimedReward(reward) ? (
          <Typography className={clsx('grayText', styles.text)}>{'Claimed'}</Typography>
        ) : (
          <ClaimRewards indexer={reward.indexerAddress} amount={formatEther(reward.amount)} />
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
          data: (data) => <Table columns={colums} dataSource={data} scroll={{ x: 800 }} />,
        },
      )}
    </div>
  );
};

export default Rewards;
