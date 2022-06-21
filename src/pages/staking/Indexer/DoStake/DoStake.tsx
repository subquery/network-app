// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useContracts, useSQToken, useWeb3 } from '../../../../containers';
import assert from 'assert';
import { tokenApprovalModalText, ModalApproveToken } from '../../../../components';
import { useIsIndexer, useLockPeriod } from '../../../../hooks';
import { formatEther, parseEther } from '@ethersproject/units';
import TransactionModal from '../../../../components/TransactionModal';
import { convertStringToNumber, mergeAsync, renderAsyncArray } from '../../../../utils';
import moment from 'moment';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/react-ui';

enum StakeAction {
  Stake = 'stake',
  UnStake = 'unstake',
}

const getContentText = (
  actionType: StakeAction,
  requireTokenApproval = false,
  t: any,
  lockPeriod: number | undefined,
) => {
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
  };
};

export const DoStake: React.VFC = () => {
  const [stakeAction, setStakeAction] = React.useState<StakeAction>(StakeAction.Stake);
  const pendingContracts = useContracts();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const lockPeriod = useLockPeriod();

  const rewardClaimStatus = useRewardCollectStatus(account || '');
  const isIndexer = useIsIndexer(account);

  const { balance, stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();

  const curAmount =
    stakeAction === StakeAction.Stake ? convertStringToNumber(formatEther(balance.data ?? 0)) : undefined;
  const showMaxButton = stakeAction === StakeAction.Stake;
  const modalText = getContentText(stakeAction, requireTokenApproval, t, lockPeriod.data);

  const handleClick = async (amount: string, stakeAction: StakeAction) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    assert(account, 'Account not available');

    const formattedAmount = parseEther(amount.toString());
    if (stakeAction === StakeAction.Stake) {
      return contracts.staking.stake(account, formattedAmount);
    } else {
      return contracts.staking.unstake(account, formattedAmount);
    }
  };

  return renderAsyncArray(mergeAsync(isIndexer, rewardClaimStatus), {
    error: (error) => <Typography>{`Failed to get indexer info: ${error.message}`}</Typography>,
    loading: () => <Spinner />,
    empty: () => <></>,
    data: (data) => {
      const [canUnstake, rewardClaimStatus] = data;

      return (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: t('indexer.stake'),
              key: StakeAction.Stake,
              onClick: () => setStakeAction(StakeAction.Stake),
              disabled: !rewardClaimStatus?.hasClaimedRewards,
              tooltip: !rewardClaimStatus?.hasClaimedRewards
                ? t('indexer.disabledStakeBeforeRewardCollect')
                : undefined,
            },
            {
              label: t('indexer.unstake'),
              key: StakeAction.UnStake,
              onClick: () => setStakeAction(StakeAction.UnStake),
              disabled: !canUnstake || !rewardClaimStatus?.hasClaimedRewards,
              tooltip: !rewardClaimStatus?.hasClaimedRewards
                ? t('indexer.disabledUnstakeBeforeRewardCollect')
                : undefined,
            },
          ]}
          inputParams={{
            showMaxButton,
            curAmount,
          }}
          onClick={handleClick}
          renderContent={(onSubmit, _, loading) => {
            return (
              requireTokenApproval && (
                <ModalApproveToken onSubmit={() => stakingAllowance.refetch()} isLoading={loading} />
              )
            );
          }}
        />
      );
    },
  });
};
