// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { Button, Spinner, Typography } from '@subql/react-ui';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@subql/react-ui/dist/components/Table';
import assert from 'assert';
import * as React from 'react';
import { useWeb3, useRewards, useContracts } from '../../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../../utils';
import {
  GetRewards_rewards_nodes as Reward,
  GetRewards_unclaimedRewards_nodes as UnclaimedReward,
} from '../../../../__generated__/GetRewards';

const UnclaimedRewardItem: React.VFC<{
  key: string;
  reward: UnclaimedReward;
  onCollectRewards?: () => void;
}> = ({ key, reward, onCollectRewards }) => {
  return (
    <TableRow>
      <TableCell>{key}</TableCell>
      <TableCell>{reward.indexerAddress}</TableCell>
      <TableCell>
        {`${formatEther(BigNumber.from(reward.amount))} SQT`}
        {onCollectRewards && <Button label="Claim" onClick={onCollectRewards} />}
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
      <TableCell>{key}</TableCell>
      <TableCell>{reward.indexerAddress}</TableCell>
      <TableCell>{`${formatEther(BigNumber.from(reward.amount))} SQT`}</TableCell>
    </TableRow>
  );
};

function isClaimedReward(reward: Reward | UnclaimedReward): reward is Reward {
  return !!(reward as Reward).claimedTime;
}

const Rewards: React.VFC<{ delegatorAddress: string }> = ({ delegatorAddress }) => {
  const { account } = useWeb3();
  const rewards = useRewards({ address: delegatorAddress });
  const pendingContracts = useContracts();

  const handleCollectRewards = async (indexer: string) => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    const tx = await contracts.rewardsDistributor.claim(indexer);

    tx.wait();
    rewards.refetch();
  };

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
      empty: () => <Typography>You have no rewards</Typography>,
      data: (data) => (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Indexer</TableCell>
                <TableCell>Amount</TableCell>
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
                    onCollectRewards={account ? () => handleCollectRewards(reward.indexerAddress) : undefined}
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
