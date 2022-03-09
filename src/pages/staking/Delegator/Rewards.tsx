// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { formatEther } from '@ethersproject/units';
import { Button, Spinner, Typography } from '@subql/react-ui';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@subql/react-ui/dist/components/Table';
import assert from 'assert';
import * as React from 'react';
import { useWeb3, useRewards, useContracts } from '../../../containers';
import { mapAsync, notEmpty, renderAsyncArray } from '../../../utils';
import { GetRewards_rewards_nodes as Reward } from '../../../__generated__/GetRewards';

const RewardsItem: React.VFC<{
  key: string;
  reward: Reward;
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
    mapAsync((data) => data.rewards?.nodes.filter(notEmpty), rewards),
    {
      error: (error) => <Typography>{`Failed to get pending rewards: ${error.message}`}</Typography>,
      loading: () => <Spinner />,
      empty: () => <Typography>You have no rewards, you can earn rewards by delegating to an indexer</Typography>,
      data: (data) => (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Indexer</TableCell>
                <TableCell>Unclaimed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* TODO render unclaimed rewards*/}
              {data.map((reward, index) => (
                <RewardsItem
                  reward={reward}
                  key={index.toString()}
                  onCollectRewards={account ? () => handleCollectRewards(reward.indexerAddress) : undefined}
                />
              ))}
            </TableBody>
          </Table>
        </>
      ),
    },
  );
};

export default Rewards;
