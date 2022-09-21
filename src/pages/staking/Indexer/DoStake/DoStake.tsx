// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useContracts, useSQToken, useWeb3 } from '../../../../containers';
import assert from 'assert';
import {
  tokenApprovalModalText,
  ModalApproveToken,
  claimIndexerRewardsModalText,
  ModalClaimIndexerRewards,
} from '../../../../components';
import { useAsyncMemo, useIsIndexer, useLockPeriod, useNetworkClient } from '../../../../hooks';
import { formatEther, parseEther } from '@ethersproject/units';
import TransactionModal from '../../../../components/TransactionModal';
import { convertStringToNumber, mergeAsync, renderAsyncArray, TOKEN } from '../../../../utils';
import moment from 'moment';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/react-ui';
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

export const DoStake: React.FC = () => {
  const [stakeAction, setStakeAction] = React.useState<StakeAction>(StakeAction.Stake);
  const [maxUnstakeAmount, setMaxUnstakeAmount] = React.useState<BigNumber>(BigNumber.from(0));
  const pendingContracts = useContracts();
  const networkClient = useNetworkClient();

  const { t } = useTranslation();
  const { account } = useWeb3();
  const lockPeriod = useLockPeriod();

  useAsyncMemo(async () => {
    const maxUnstakeAmount = await networkClient?.maxUnstakeAmount(account ?? '');
    setMaxUnstakeAmount(maxUnstakeAmount ?? BigNumber.from(0));
  }, [account, networkClient]);

  const rewardClaimStatus = useRewardCollectStatus(account || '');
  const isIndexer = useIsIndexer(account);

  const { balance, stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();

  const curAmount = convertStringToNumber(
    formatEther(stakeAction === StakeAction.Stake ? balance.data ?? 0 : maxUnstakeAmount),
  );

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
      const [canUnstake, indexerRewards] = data;
      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;

      const modalText = getContentText(
        requireClaimIndexerRewards,
        requireTokenApproval,
        stakeAction,
        t,
        lockPeriod.data,
      );

      return (
        <TransactionModal
          text={modalText}
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
              disabled: !canUnstake,
              tooltip: !canUnstake ? t('indexer.doStake') : undefined,
            },
          ]}
          inputParams={{
            showMaxButton: true,
            inputBottomText:
              stakeAction === StakeAction.UnStake
                ? t('indexer.unstakeBalanceNextEra', { amount: curAmount, token: TOKEN })
                : undefined,
            curAmount,
          }}
          onClick={handleClick}
          renderContent={(onSubmit, _, loading) => {
            if (requireClaimIndexerRewards) {
              return <ModalClaimIndexerRewards onSuccess={() => rewardClaimStatus.refetch()} indexer={account ?? ''} />;
            }

            if (requireTokenApproval && !requireClaimIndexerRewards) {
              return <ModalApproveToken onSubmit={() => stakingAllowance.refetch()} isLoading={loading} />;
            }
          }}
        />
      );
    },
  });
};
