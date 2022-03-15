// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useContracts, useSQToken, useWeb3 } from '../../../../containers';
import assert from 'assert';
import { tokenApprovalModalText, ModalApproveToken } from '../../../../components';
import { useIsIndexer } from '../../../../hooks';
import { formatEther, parseEther } from '@ethersproject/units';
import TransactionModal from '../../../../components/TransactionModal';
import { convertStringToNumber } from '../../../../utils';

enum StakeAction {
  Stake = 'stake',
  UnStake = 'unstake',
}

const getContentText = (actionType: StakeAction, requireTokenApproval = false, t: any) => {
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
    description: t('indexer.unstakeValidNextEra'),
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
  /* TODO change to isIndexer */
  const isIndexer = useIsIndexer(account);
  const canUnstake = isIndexer.data;

  const { balance, stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();

  const curAmount = stakeAction === StakeAction.Stake ? convertStringToNumber(formatEther(balance.data ?? 0)) : undefined;
  const showMaxButton = stakeAction === StakeAction.Stake;
  const modalText = getContentText(stakeAction, requireTokenApproval, t);

  const handleClick = async (amount: string, stakeAction: StakeAction) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const formattedAmount = parseEther(amount.toString());
    if (stakeAction === StakeAction.Stake) {
      return contracts.indexerRegistry.stake(formattedAmount);
    } else {
      return contracts.indexerRegistry.unstake(formattedAmount);
    }
  };

  return (
    <TransactionModal
      text={modalText}
      actions={[
        { label: t('indexer.stake'), key: StakeAction.Stake, onClick: () => setStakeAction(StakeAction.Stake) },
        { label: t('indexer.unstake'), key: StakeAction.UnStake, onClick: () => setStakeAction(StakeAction.UnStake), disabled: !canUnstake },
      ]}
      inputParams={{
        showMaxButton,
        curAmount,
      }}
      onClick={handleClick}
      renderContent={ (onSubmit, loading) => {
        return requireTokenApproval
          && <ModalApproveToken onSubmit={() => stakingAllowance.refetch()} isLoading={loading}/>
      }}
    />
  );
};
