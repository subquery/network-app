// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useContracts, useIndexer, useSQToken, useWeb3 } from '../../../../containers';
import assert from 'assert';
import {
  tokenApprovalModalText,
  ModalApproveToken,
  claimIndexerRewardsModalText,
  ModalClaimIndexerRewards,
} from '../../../../components';
import { useLockPeriod } from '../../../../hooks';
import { parseEther } from '@ethersproject/units';
import TransactionModal from '../../../../components/TransactionModal';
import { formatEther, isUndefined, mergeAsync, renderAsyncArray } from '../../../../utils';
import moment from 'moment';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/react-ui';
import { useMaxUnstakeAmount } from '../../../../hooks/useMaxUnstakeAmount';
import { JSONBigInt } from '@subql/network-clients';
import { jsonBigIntToBigInt } from '../../../../hooks/useEraValue';
import { BigNumber } from 'ethers';

enum StakeAction {
  Stake = 'stake',
  UnStake = 'unstake',
}

const getContentText = (
  requireClaimIndexerRewards = false,
  requireTokenApproval = false,
  actionType: StakeAction,
  t: any,
  lockPeriod: number | undefined,
  maxAmount: string | undefined,
) => {
  if (requireClaimIndexerRewards) return claimIndexerRewardsModalText;

  if (actionType === StakeAction.Stake) {
    return requireTokenApproval
      ? tokenApprovalModalText
      : {
          title: t('indexer.stake'),
          steps: [t('indexer.enterStakeAmount'), t('indexer.confirmOnMetamask')],
          description: t('indexer.stakeValidNextEra'),
          inputTitle: t('indexer.stakeInputTitle'),
          submitText: t('indexer.confirmStake'),
          failureText: `Sorry, the ${actionType} operation has failed.`,
          inputBottomText: t('indexer.maxStakeBalance', { tokenAmount: maxAmount }),
        };
  }

  return {
    title: t('indexer.unstake'),
    steps: [t('indexer.enterUnstakeAmount'), t('indexer.confirmOnMetamask')],
    description: t('indexer.unstakeValidNextEra', {
      duration: `${moment.duration(lockPeriod, 'seconds').as('hours').toPrecision(3)} hours`,
    }),
    inputTitle: t('indexer.unstakeInputTitle'),
    submitText: t('indexer.confirmUnstake'),
    failureText: `Sorry, the ${actionType} operation has failed.`,
    inputBottomText: t('indexer.unstakeBalanceNextEra', { tokenAmount: maxAmount ?? '-' }),
  };
};

export const DoStake: React.FC = () => {
  const [stakeAction, setStakeAction] = React.useState<StakeAction>(StakeAction.Stake);
  const pendingContracts = useContracts();

  const { t } = useTranslation();
  const { account } = useWeb3();
  const lockPeriod = useLockPeriod();

  const maxUnstake = useMaxUnstakeAmount(account || '');
  const rewardClaimStatus = useRewardCollectStatus(account || '');
  const indexer = useIndexer({ address: account || '' });

  const { balance, stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();

  const handleClick = async (amount: string, stakeAction: StakeAction) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    assert(account, 'Account not available');

    const formattedAmount = parseEther(amount.toString());
    if (stakeAction === StakeAction.Stake) {
      return contracts.stakingManager.stake(account, formattedAmount);
    } else {
      return contracts.stakingManager.unstake(account, formattedAmount);
    }
  };

  return renderAsyncArray(mergeAsync(rewardClaimStatus, indexer), {
    error: (error) => <Typography>{`Failed to get indexer info: ${error.message}`}</Typography>,
    loading: () => <Spinner />,
    empty: () => <></>,
    data: (data) => {
      const [indexerRewards, indexer] = data;
      const maxUnstakeAmount = indexer?.indexer?.maxUnstakeAmount as JSONBigInt;

      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;
      const curAmount = stakeAction === StakeAction.Stake ? balance.data : jsonBigIntToBigInt(maxUnstakeAmount);
      const curAmountTruncated = curAmount ? formatEther(curAmount, 4) : '-';

      const modalText = getContentText(
        requireClaimIndexerRewards,
        requireTokenApproval,
        stakeAction,
        t,
        lockPeriod.data,
        curAmountTruncated,
      );

      return (
        <TransactionModal
          text={modalText}
          loading={isUndefined(indexerRewards)}
          // loading={isUndefined(indexerRewards) || isUndefined(maxUnstakeAmount)} // TODO: maxUnstakeAmount from network-client
          actions={[
            {
              label: t('indexer.stake'),
              key: StakeAction.Stake,
              onClick: () => setStakeAction(StakeAction.Stake),
            },
            {
              label: t('indexer.unstake'),
              key: StakeAction.UnStake,
              onClick: () => setStakeAction(StakeAction.UnStake),
            },
          ]}
          inputParams={{
            showMaxButton: true,
            curAmount: formatEther(curAmount),
          }}
          onSuccess={() => (stakeAction === StakeAction.Stake ? balance.refetch(true) : maxUnstake.refetch(true))}
          onClick={handleClick}
          renderContent={(onSubmit, _, loading) => {
            if (requireClaimIndexerRewards) {
              return (
                <ModalClaimIndexerRewards onSuccess={() => rewardClaimStatus.refetch(true)} indexer={account ?? ''} />
              );
            }

            if (requireTokenApproval && !requireClaimIndexerRewards) {
              return <ModalApproveToken onSubmit={() => stakingAllowance.refetch(true)} isLoading={loading} />;
            }
          }}
        />
      );
    },
  });
};
