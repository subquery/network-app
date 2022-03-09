// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import * as React from 'react';
import assert from 'assert';
import { parseEther } from '@ethersproject/units';
import styles from './SetCommissionRate.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts } from '../../../../containers';
import { ModalInput, Modal } from '../../../../components';
import { useBalance } from '../../../../hooks/useBalance';

export const SetCommissionRate: React.VFC = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { account, balance } = useBalance();
  const pendingContracts = useContracts();
  const { t } = useTranslation();

  const curAmount = 10;
  const unit = '%';
  const modalText = {
    title: t('indexer.updateCommissionRate'),
    steps: [t('indexer.setNewCommissionRate'), t('indexer.confirmOnMetamask')],
    description: t('indexer.newRateValidNext2Era'),
    inputTitle: t('indexer.enterCommissionRate'),
    submitText: t('indexer.confirmRate'),
  };
  const handleBtnClick = () => {
    setShowModal(true);
  };

  const resetModal = () => {
    setIsLoading(false);
    setShowModal(false);
  };

  const onSubmit = async (amount: number) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');
    const tx = await contracts.indexerRegistry.setCommissionRate(Math.floor(amount * 10));
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
            unit={unit}
            max={100}
            min={0}
          />
        }
      />
      <Button
        label={t('indexer.updateCommissionRate')}
        onClick={() => handleBtnClick()}
        className={styles.btn}
        size="medium"
      />
    </div>
  );
};
