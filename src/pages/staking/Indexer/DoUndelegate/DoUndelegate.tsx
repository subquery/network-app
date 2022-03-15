// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import * as React from 'react';
import assert from 'assert';
import { parseEther } from 'ethers/lib/utils';
import styles from './DoUndelegate.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3, useWithdrawls } from '../../../../containers';
import { ModalInput, Modal } from '../../../../components';
import { ModalStatus } from '../../../../components/ModalStatus';
import { useBalance } from '../../../../hooks/useBalance';

interface DoUndelegateProps {
  indexerAddress: string;
}

export const DoUndelegate: React.VFC<DoUndelegateProps> = ({ indexerAddress }) => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [errorModalText, setErrorModalText] = React.useState<string | undefined>();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const withdrawals = useWithdrawls({ delegator: account || '' });
  const pendingContracts = useContracts();

  const modalText = {
    title: t('delegate.undelegate'),
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
    description: t('delegate.undelegateValidNextEra'),
    inputTitle: t('delegate.undelegateAmount'),
    submitText: t('delegate.confirmUndelegate'),
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

  const onSubmit = async (indexerAddress: string, amount: number) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(amount.toString());
    const tx = await contracts.staking.undelegate(indexerAddress, delegateAmount);
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
        content={
          <ModalInput
            inputTitle={modalText?.inputTitle}
            submitText={modalText?.submitText}
            onSubmit={(amount: number) => onSubmit(indexerAddress, amount)}
            isLoading={isLoading}
            showMaxButton
          />
        }
      />
      <ModalStatus
        visible={!!(errorModalText || successModalText)}
        onCancel={resetModalStatus}
        error={!!errorModalText}
        success={!!successModalText}
      />
      <Button label={t('delegate.undelegate')} onClick={() => handleBtnClick()} className={styles.btn} size="small" />
    </div>
  );
};
