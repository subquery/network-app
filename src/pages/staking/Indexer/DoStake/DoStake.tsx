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
import { ModalStatus } from '../../../../components/ModalStatus';

enum StakeAction {
  Stake = 'stake',
  UnStake = 'unstake',
}

const getContentText = (actionType: StakeAction | undefined, t: any) => {
  if (!actionType) return {};
  if (actionType === StakeAction.Stake) {
    return {
      title: t('indexer.stake'),
      steps: [t('indexer.enterStakeAmount'), t('indexer.confirmOnMetamask')],
      description: t('indexer.stakeValidNextEra'),
      inputTitle: t('indexer.stakeInputTitle'),
      submitText: t('indexer.confirmStake'),
    };
  }

  if (actionType === StakeAction.UnStake) {
    return {
      title: t('indexer.unstake'),
      steps: [t('indexer.enterUnstakeAmount'), t('indexer.confirmOnMetamask')],
      description: t('indexer.unstakeValidNextEra'),
      inputTitle: t('indexer.unstakeInputTitle'),
      submitText: t('indexer.confirmUnstake'),
    };
  }
};

export const DoStake: React.VFC = () => {
  const [stakeAction, setStakeAction] = React.useState<StakeAction | undefined>();
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [errorModalText, setErrorModalText] = React.useState<string | undefined>();
  const { account, balance } = useBalance();
  const pendingContracts = useContracts();
  const { t } = useTranslation();

  const curAmount = stakeAction === StakeAction.Stake ? balance : undefined;
  const showMaxButton = stakeAction === StakeAction.Stake;
  const modalText = getContentText(stakeAction, t);
  const handleBtnClick = (stakeAction: StakeAction) => {
    setStakeAction(stakeAction);
    setShowModal(true);
  };

  const resetModalStatus = () => {
    setSuccessModalText(undefined);
    setErrorModalText(undefined);
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
    const txResult = await tx.wait();
    resetModal();
    console.log('txResult', txResult?.status);
    if (txResult?.status === 1) {
      setSuccessModalText('Success');
    } else {
      setErrorModalText('Error');
    }
  };

  return (
    <div className={styles.btns}>
      <Modal
        title={modalText?.title}
        description={modalText?.description}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        steps={modalText?.steps}
        amountInput={
          <ModalInput
            inputTitle={modalText?.inputTitle}
            submitText={modalText?.submitText}
            onSubmit={(amount: number) => onSubmit(amount)}
            curAmount={curAmount}
            isLoading={isLoading}
            showMaxButton={showMaxButton}
          />
        }
      />
      <ModalStatus
        visible={!!(errorModalText || successModalText)}
        onCancel={resetModalStatus}
        error={!!errorModalText}
        success={!!successModalText}
      />
      <Button
        label={t('indexer.stake')}
        onClick={() => handleBtnClick(StakeAction.Stake)}
        className={styles.btn}
        size="medium"
      />
      <Button
        label={t('indexer.unstake')}
        onClick={() => handleBtnClick(StakeAction.UnStake)}
        className={styles.btn}
        size="medium"
      />
    </div>
  );
};
