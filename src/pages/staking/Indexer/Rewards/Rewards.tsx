// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { Spinner, Typography } from '@subql/react-ui';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@subql/react-ui/dist/components/Table';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useRewards } from '../../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import {
  GetRewards_rewards_nodes as Reward,
  GetRewards_unclaimedRewards_nodes as UnclaimedReward,
} from '../../../../__generated__/GetRewards';
import ClaimRewards from './ClaimRewards';

const UnclaimedRewardItem: React.VFC<{
  key: string;
  reward: UnclaimedReward;
  onRewardsClaimed?: () => void;
}> = ({ key, reward }) => {
  const amount = formatEther(BigNumber.from(reward.amount));
  return (
    <TableRow>
      <TableCell>
        <Typography>{key}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{reward.indexerAddress}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{`${amount} SQT`}</Typography>
      </TableCell>
      <TableCell>
        <ClaimRewards indexer={reward.indexerAddress} amount={amount} />
      </TableCell>
    </TableRow>
  );
};

const ClaimedReward: React.VFC<{
  key: string;
  reward: Reward;
}> = ({ key, reward }) => {
  return (
    <TableRow>
      <TableCell>
        <Typography>{key}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{reward.indexerAddress}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{`${formatEther(BigNumber.from(reward.amount))} SQT`}</Typography>
      </TableCell>
    </TableRow>
  );
};

function isClaimedReward(reward: Reward | UnclaimedReward): reward is Reward {
  return !!(reward as Reward).claimedTime;
}

const Rewards: React.VFC<{ delegatorAddress: string }> = ({ delegatorAddress }) => {
  const rewards = useRewards({ address: delegatorAddress });
  const { t } = useTranslation('translation');

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
      data: (data) => (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography>#</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{t('rewards.header1')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{t('rewards.header2')}</Typography>
                </TableCell>
                <TableCell>
                  <Typography>{t('rewards.header3')}</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((reward, index) =>
                isClaimedReward(reward) ? (
                  <ClaimedReward reward={reward} key={index.toString()} />
                ) : (
                  <UnclaimedRewardItem
                    reward={reward}
                    key={index.toString()}
                    onRewardsClaimed={() => rewards.refetch()}
                  />
                ),
              )}
            </TableBody>
          </Table>
        </>
      ),
    },
  );
};

export default Rewards;
