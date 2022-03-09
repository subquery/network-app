// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import * as React from 'react';
import styles from './DoStake.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts } from '../../../../containers';
import assert from 'assert';
import { ModalInput, Modal } from '../../../../components';
import { useBalance } from '../../../../hooks/useBalance';
import { parseEther } from '@ethersproject/units';

enum StakeAction {
  Stake = 'stake',
  UNStake = 'unstake',
}

const getStakeText = (t: (s: any) => any) => ({
  title: t('indexer.stake'),
  steps: [t('indexer.enterStakeAmount'), t('indexer.confirmOnMetamask')],
  description: t('indexer.stakeValidNextEra'),
  inputTitle: t('indexer.stakeInputTitle'),
  submitText: t('indexer.confirmStake'),
});

const getUnstakeText = (t: (s: any) => any) => ({
  title: t('indexer.unstake'),
  steps: [t('indexer.enterUnstakeAmount'), t('indexer.confirmOnMetamask')],
  description: t('indexer.unstakeValidNextEra'),
  inputTitle: t('indexer.unstakeInputTitle'),
  submitText: t('indexer.confirmUnstake'),
});

export const DoStake: React.VFC = () => {
  const [stakeAction, setStakeAction] = React.useState<StakeAction | null>();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { account, balance } = useBalance();
  const pendingContracts = useContracts();
  const { t } = useTranslation();

  const maxBalance = stakeAction === StakeAction.Stake ? balance : undefined;
  const modalText = stakeAction === StakeAction.Stake ? getStakeText(t) : getUnstakeText(t);
  const handleBtnClick = (stakeAction: StakeAction) => {
    setStakeAction(stakeAction);
    setShowModal(true);
  };

  const resetModal = () => {
    setIsLoading(false);
    setShowModal(false);
  };

  const onSubmit = async (amount: number) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const formattedAmount = parseEther(amount.toString());
    let tx;
    if (stakeAction === StakeAction.Stake) {
      tx = await contracts.indexerRegistry.stake(formattedAmount);
    } else {
      tx = await contracts.indexerRegistry.unstake(formattedAmount);
    }
    setIsLoading(true);
    console.log('tx', tx);
    const txResult = await tx.wait();
    // TODO: error/success handler - need design confirm
    console.log('txResult', txResult?.status);

    resetModal();
  };

  return (
    <div className={styles.btns}>
      <Modal
        title={modalText.title}
        description={modalText.description}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        steps={modalText.steps}
        amountInput={
          <ModalInput
            inputTitle={modalText.inputTitle}
            onSubmit={(amount: number) => onSubmit(amount)}
            maxBalance={maxBalance}
            isLoading={isLoading}
          />
        }
      />
      <Button
        label={t('indexer.stake')}
        onClick={() => handleBtnClick(StakeAction.Stake)}
        className={styles.btn}
        size="medium"
      />
      <Button
        label={t('indexer.unstake')}
        onClick={() => handleBtnClick(StakeAction.UNStake)}
        className={styles.btn}
        size="medium"
      />
    </div>
  );
};
