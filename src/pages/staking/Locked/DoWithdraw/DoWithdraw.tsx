// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import * as React from 'react';
import assert from 'assert';
import styles from './DoWithdraw.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3, useWithdrawls } from '../../../../containers';
import { ModalInput, Modal } from '../../../../components';
import { ModalStatus } from '../../../../components/ModalStatus';

export const DoWithdraw: React.VFC = () => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [errorModalText, setErrorModalText] = React.useState<string | undefined>();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const withdrawals = useWithdrawls({ delegator: account || '' });
  const pendingContracts = useContracts();

  const modalText = {
    title: t('withdrawals.withdraw'),
    steps: [t('withdrawals.enterAmount'), t('indexer.confirmOnMetamask')],
    inputTitle: t('withdrawals.enterWithdrawAmount'),
    submitText: t('withdrawals.confirmWithdraw'),
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

  const onSubmit = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');
    const tx = await contracts.staking.widthdraw();
    setIsLoading(true);

    const txResult = await tx.wait();
    await withdrawals.refetch();
    resetModal();
    console.log('txResult', txResult?.status);
    if (txResult?.status === 1) {
      setSuccessModalText('Success');
    } else {
      setErrorModalText('Error');
    }
  };

  return (
    <div>
      <Modal
        title={modalText?.title}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        steps={modalText?.steps}
        amountInput={
          <ModalInput
            inputTitle={modalText?.inputTitle}
            submitText={modalText?.submitText}
            onSubmit={onSubmit}
            isLoading={isLoading}
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
        label={t('withdrawals.withdrawToken')}
        onClick={() => handleBtnClick()}
        className={styles.btn}
        size="medium"
      />
    </div>
  );
};
