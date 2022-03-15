// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import * as React from 'react';
import assert from 'assert';
import styles from './SetCommissionRate.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3 } from '../../../../containers';
import { ModalInput, Modal } from '../../../../components';
import { ModalStatus } from '../../../../components/ModalStatus';
import { useSortedIndexer } from '../../../../hooks';

export const SetCommissionRate: React.VFC = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [errorModalText, setErrorModalText] = React.useState<string | undefined>();

  const { account } = useWeb3();
  const sortedIndexer = useSortedIndexer(account || '');

  const pendingContracts = useContracts();
  const { t } = useTranslation();

  // TODO:useCommission
  // const curAmount = 10;
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
    const tx = await contracts.staking.setCommissionRate(Math.floor(amount * 10));
    setIsLoading(true);

    const txResult = await tx.wait();
    resetModal();
    console.log('txResult', txResult?.status);
    if (txResult?.status === 1) {
      setSuccessModalText('Success');
    } else {
      throw Error(`Sorry, the commission update operation has failed.`);
    }
  };

  if (!sortedIndexer.data) return null;

  return (
    <div className={styles.btns}>
      <Modal
        title={modalText?.title}
        description={modalText?.description}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        steps={modalText?.steps}
        content={
          <ModalInput
            inputTitle={modalText?.inputTitle}
            submitText={modalText?.submitText}
            onSubmit={(amount: number) => onSubmit(amount)}
            // curAmount={curAmount}
            isLoading={isLoading}
            unit={unit}
            max={100}
            min={0}
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
        label={t('indexer.updateCommissionRate')}
        onClick={() => handleBtnClick()}
        className={styles.btn}
        size="medium"
      />
    </div>
  );
};
