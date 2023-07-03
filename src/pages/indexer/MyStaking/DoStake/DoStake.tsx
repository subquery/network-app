// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  claimIndexerRewardsModalText,
  ModalApproveToken,
  ModalClaimIndexerRewards,
  tokenApprovalModalText,
} from '@components';
import TransactionModal from '@components/TransactionModal';
import { TransactionModalAction } from '@components/TransactionModal/TransactionModal';
import { useSQToken, useWeb3 } from '@containers';
import { parseEther } from '@ethersproject/units';
import { useLockPeriod } from '@hooks';
import { useMaxUnstakeAmount } from '@hooks/useMaxUnstakeAmount';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/components';
import { formatEther, isUndefined, mergeAsync, renderAsyncArray } from '@utils';
import assert from 'assert';
import { TFunction } from 'i18next';
import moment from 'moment';

import { useWeb3Store } from 'src/stores';

enum StakeAction {
  Stake = 'stake',
  UnStake = 'unstake',
}

const getContentText = (
  requireClaimIndexerRewards = false,
  requireTokenApproval = false,
  actionType: StakeAction,
  t: TFunction,
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
  const { contracts } = useWeb3Store();

  const { t } = useTranslation();
  const { account } = useWeb3();
  const lockPeriod = useLockPeriod();

  const maxUnstake = useMaxUnstakeAmount(account || '');
  const rewardClaimStatus = useRewardCollectStatus(account || '');

  const { balance, stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();

  const handleClick = async (amount: string, stakeAction: StakeAction) => {
    assert(contracts, 'Contracts not available');

    assert(account, 'Account not available');

    const formattedAmount = parseEther(amount.toString());
    if (stakeAction === StakeAction.Stake) {
      return contracts.stakingManager.stake(account, formattedAmount);
    } else {
      return contracts.stakingManager.unstake(account, formattedAmount);
    }
  };

  return renderAsyncArray(mergeAsync(rewardClaimStatus, maxUnstake), {
    error: (error) => (
      <Typography>
        {t('errors.failedToGetIndexerInfo', {
          message: error.message,
        })}
      </Typography>
    ),
    loading: () => <Spinner />,
    empty: () => <></>,
    data: (data) => {
      const [indexerRewards, maxUnstakeData] = data;

      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;
      const curAmount = stakeAction === StakeAction.Stake ? balance.data : maxUnstakeData;
      const curAmountTruncated = curAmount ? formatEther(curAmount, 4) : '-';
      const isMaxUnstakeZero = maxUnstakeData?.isZero();

      const modalText = getContentText(
        requireClaimIndexerRewards,
        requireTokenApproval,
        stakeAction,
        t,
        lockPeriod.data,
        curAmountTruncated,
      );

      const stakeButton: TransactionModalAction<StakeAction.Stake> = {
        label: t('indexer.stake'),
        key: StakeAction.Stake,
        onClick: () => setStakeAction(StakeAction.Stake),
      };

      const unstakeButton: TransactionModalAction<StakeAction.UnStake> = {
        label: t('indexer.unstake'),
        key: StakeAction.UnStake,
        onClick: () => setStakeAction(StakeAction.UnStake),
        disabled: isMaxUnstakeZero,
        tooltip: isMaxUnstakeZero ? t('indexer.unStakeTooltip') : undefined,
      };

      // const actions = isMaxUnstakeZero ? [stakeButton] : [stakeButton, unstakeButton];
      const actions = [stakeButton, unstakeButton];

      return (
        <TransactionModal
          text={modalText}
          loading={isUndefined(indexerRewards) || isUndefined(maxUnstakeData)}
          actions={actions}
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
