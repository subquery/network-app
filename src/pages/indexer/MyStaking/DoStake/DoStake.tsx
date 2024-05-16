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
import { OutlineDot } from '@components/Icons/Icons';
import TransactionModal from '@components/TransactionModal';
import { TransactionModalAction, TransactionModalRef } from '@components/TransactionModal/TransactionModal';
import { useSQToken, useWeb3 } from '@containers';
import { parseEther } from '@ethersproject/units';
import { useEra, useLockPeriod } from '@hooks';
import { useMaxUnstakeAmount } from '@hooks/useMaxUnstakeAmount';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Spinner, Typography } from '@subql/components';
import { formatEther, isUndefined, mergeAsync, renderAsyncArray } from '@utils';
import { Button, Dropdown, Tooltip } from 'antd';
import assert from 'assert';
import dayjs from 'dayjs';
import { TFunction } from 'i18next';

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
      duration: `${dayjs
        .duration(+(lockPeriod || 0), 'seconds')
        .as('hours')
        .toPrecision(3)} hours`,
    }),
    inputTitle: t('indexer.unstakeInputTitle'),
    submitText: t('indexer.confirmUnstake'),
    failureText: `Sorry, the ${actionType} operation has failed.`,
    inputBottomText: t('indexer.unstakeBalanceNextEra', { tokenAmount: maxAmount ?? '-' }),
  };
};

export const DoStake: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [stakeAction, setStakeAction] = React.useState<StakeAction>(StakeAction.Stake);
  const modalRef = React.useRef<TransactionModalRef>(null);
  const { contracts } = useWeb3Store();
  const { currentEra } = useEra();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const lockPeriod = useLockPeriod();
  const waitTransactionHandled = useWaitTransactionhandled();

  const maxUnstake = useMaxUnstakeAmount(account || '', +(currentEra.data?.index.toString() || 0));
  const rewardClaimStatus = useRewardCollectStatus(account || '');

  const { balance, stakingAllowance } = useSQToken();

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
      const curAmount = stakeAction === StakeAction.Stake ? balance.result.data : maxUnstakeData;
      const curAmountTruncated = curAmount ? formatEther(curAmount, 4) : '-';
      const isMaxUnstakeZero = maxUnstakeData?.isZero();
      const requireTokenApproval = stakingAllowance?.result.data?.isZero();
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
        style: { display: 'none' },
      };

      const unstakeButton: TransactionModalAction<StakeAction.UnStake> = {
        label: t('indexer.unstake'),
        key: StakeAction.UnStake,
        onClick: () => setStakeAction(StakeAction.UnStake),
        disabled: isMaxUnstakeZero,
        tooltip: isMaxUnstakeZero ? t('indexer.unStakeTooltip') : undefined,
        style: { display: 'none' },
      };

      const actions = [stakeButton, unstakeButton];

      return (
        <>
          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <Button type="text" style={{ padding: 0, background: 'transparent' }} size="small">
                      Stake more
                    </Button>
                  ),
                  key: 1,
                  onClick: () => {
                    if (modalRef.current) {
                      modalRef.current.showModal(stakeButton.key);
                    }
                    stakeButton.onClick?.();
                  },
                },
                {
                  label: (
                    <Tooltip title={isMaxUnstakeZero ? t('indexer.unStakeTooltip') : undefined}>
                      <Button
                        size="small"
                        type="text"
                        disabled={isMaxUnstakeZero}
                        style={{ padding: 0, background: 'transparent' }}
                        onClick={() => {
                          if (modalRef.current) {
                            modalRef.current.showModal(unstakeButton.key);
                          }
                          unstakeButton.onClick?.();
                        }}
                      >
                        Unstake
                      </Button>
                    </Tooltip>
                  ),
                  key: 2,
                },
              ],
            }}
          >
            <OutlineDot></OutlineDot>
          </Dropdown>
          <TransactionModal
            ref={modalRef}
            text={modalText}
            loading={isUndefined(indexerRewards) || isUndefined(maxUnstakeData)}
            actions={actions}
            inputParams={{
              showMaxButton: true,
              curAmount: formatEther(curAmount),
            }}
            onSuccess={async (_, receipt) => {
              await waitTransactionHandled(receipt?.blockNumber);
              stakeAction === StakeAction.Stake ? balance.refetch() : maxUnstake.refetch(true);
              await onSuccess();
            }}
            onClick={handleClick}
            renderContent={(onSubmit, _, loading) => {
              if (requireClaimIndexerRewards) {
                return (
                  <ModalClaimIndexerRewards onSuccess={() => rewardClaimStatus.refetch(true)} indexer={account ?? ''} />
                );
              }

              if (requireTokenApproval && !requireClaimIndexerRewards) {
                return <ModalApproveToken onSubmit={() => stakingAllowance.refetch()} isLoading={loading} />;
              }
            }}
          />
        </>
      );
    },
  });
};
