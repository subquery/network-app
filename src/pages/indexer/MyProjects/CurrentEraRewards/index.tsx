import React, { FC } from 'react';
import { gql, useQuery } from '@apollo/client';
import { useEra } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { useAsyncMemo } from '@subql/react-hooks';
import { cidToBytes32, formatSQT, TOKEN } from '@utils';
import { Tooltip } from 'antd';
import BigNumberJs from 'bignumber.js';

import { useWeb3Store } from 'src/stores';

import styles from './index.module.less';

interface IProps {
  deploymentId: string;
  indexerAddress: string;
}

const CurrentEraRewards: FC<IProps> = ({ indexerAddress, deploymentId }) => {
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const currentEraAllocatedAndQueryRewards = useQuery<{
    indexerEraDeploymentReward: {
      allocationRewards: string;
      queryRewards: string;
    };
  }>(
    gql`
      query GetAllocationRewardsByDeploymentId($id: String!) {
        indexerEraDeploymentReward(id: $id) {
          allocationRewards
          queryRewards
        }
      }
    `,
    {
      variables: {
        id: `${indexerAddress}:${deploymentId}:${currentEra.data?.index || 0}`,
      },
    },
  );
  const currentEraFlexPlanRewards = useAsyncMemo(async () => {
    if (!contracts) return;
    const [rewards] = await contracts.rewardsPool.getReward(
      cidToBytes32(deploymentId),
      currentEra.data?.index || 0,
      indexerAddress,
    );

    return formatSQT(rewards.toString());
  }, [contracts, deploymentId, currentEra.data?.index, indexerAddress]);

  const currentEraUncollectedFlexPlanRewards = useAsyncMemo(async () => {
    const res = await fetch(
      `${import.meta.env.VITE_CONSUMER_HOST_ENDPOINT}/statistic-indexer-channel?indexer=${indexerAddress.toLowerCase()}&deployment=${deploymentId}`,
    );
    const { onchain, spent }: { onchain: string; spent: string } = await res.json();

    return formatSQT(BigNumberJs(spent).minus(onchain).toString());
  }, [deploymentId, indexerAddress]);

  const currentEraUncollectedRewards = useAsyncMemo(async () => {
    if (!contracts) return;
    const [rewards] = await contracts.rewardsBooster.getAllocationRewards(cidToBytes32(deploymentId), indexerAddress);

    return formatSQT(rewards.toString());
  }, [contracts, deploymentId, indexerAddress]);

  return (
    <div className="col-flex">
      <div className="flex" style={{ gap: 10 }}>
        Current Era Allocation Rewards:{' '}
        {currentEraAllocatedAndQueryRewards.loading || currentEraUncollectedRewards.loading ? (
          <Spinner size={10}></Spinner>
        ) : (
          <Tooltip
            title={
              <div className="col-flex">
                <Typography style={{ color: '#fff' }} variant="small">
                  Collected:{' '}
                  {formatSQT(
                    currentEraAllocatedAndQueryRewards.data?.indexerEraDeploymentReward?.allocationRewards || '0',
                  )}{' '}
                  {TOKEN}
                </Typography>{' '}
                <Typography style={{ color: '#fff' }} variant="small">
                  Uncollected: {currentEraUncollectedRewards.data?.toString() || '0'} {TOKEN}
                </Typography>
              </div>
            }
          >
            <div
              onClick={() => {
                currentEraAllocatedAndQueryRewards.refetch();
                currentEraUncollectedRewards.refetch();
              }}
              style={{ cursor: 'pointer' }}
            >
              {BigNumberJs(
                formatSQT(
                  currentEraAllocatedAndQueryRewards.data?.indexerEraDeploymentReward?.allocationRewards || '0',
                ),
              )
                .plus(currentEraUncollectedRewards.data?.toString() || '0')
                .toFixed(6)}{' '}
              {TOKEN}
            </div>
          </Tooltip>
        )}
      </div>

      {/* hide for now */}
      {/* <div className="flex" style={{ gap: 10 }}>
        Current Era Query Rewards:{' '}
        {currentEraFlexPlanRewards.loading || currentEraUncollectedFlexPlanRewards.loading ? (
          <Spinner size={10}></Spinner>
        ) : (
          <Tooltip
            title={
              <div className="col-flex">
                <Typography style={{ color: '#fff' }} variant="small">
                  On chain: {currentEraFlexPlanRewards.data?.toString() || '0'} {TOKEN}
                </Typography>
                <Typography style={{ color: '#fff' }} variant="small">
                  Off chain: {currentEraUncollectedFlexPlanRewards.data?.toString() || '0'} {TOKEN}
                </Typography>
              </div>
            }
          >
            <div
              onClick={() => {
                currentEraFlexPlanRewards.refetch();
                currentEraUncollectedFlexPlanRewards.refetch();
              }}
              style={{ cursor: 'pointer' }}
            >
              {BigNumberJs(currentEraUncollectedFlexPlanRewards.data?.toString() || '0')
                .plus(currentEraFlexPlanRewards.data?.toString() || '0')
                .toFixed(6)}{' '}
              {TOKEN}
            </div>
          </Tooltip>
        )}
      </div> */}
    </div>
  );
};
export default CurrentEraRewards;
