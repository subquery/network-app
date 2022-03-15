// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from '@subql/react-ui';
import * as React from 'react';
import assert from 'assert';
import { parseEther } from 'ethers/lib/utils';
import styles from './DoDelegate.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3, useWithdrawls } from '../../../../containers';
import { ModalInput, Modal, tokenApprovalModalText, ModalApproveToken } from '../../../../components';
import { ModalStatus } from '../../../../components/ModalStatus';
import { useBalance } from '../../../../hooks/useBalance';
import { useHasAllowance } from '../../../../hooks';

interface DoDelegateProps {
  indexerAddress: string;
}

export const DoDelegate: React.VFC<DoDelegateProps> = ({ indexerAddress }) => {
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [successModalText, setSuccessModalText] = React.useState<string | undefined>();
  const [errorModalText, setErrorModalText] = React.useState<string | undefined>();
  const { t } = useTranslation();

  const { account } = useWeb3();
  const withdrawals = useWithdrawls({ delegator: account || '' });
  const pendingContracts = useContracts();
  const { balance } = useBalance();
  const hasAllowance = useHasAllowance();
  const requireTokenApproval = hasAllowance?.data?.isZero();

  //TODO: define the returnType wen tokenApproval UI confirm
  const modalText: any = requireTokenApproval
    ? tokenApprovalModalText
    : {
        title: t('delegate.title'),
        steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
        description: t('delegate.delegateValidNextEra'),
        inputTitle: t('delegate.delegateAmount'),
        submitText: t('delegate.confirmDelegate'),
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
    setIsLoading(true);
    const tx = await contracts.staking.delegate(indexerAddress, delegateAmount);
    const txResult = await tx.wait();
    await withdrawals.refetch();
    resetModal();
    console.log('txResult', txResult?.status);
    if (txResult?.status === 1) {
      setSuccessModalText('Success');
    } else {
      throw Error('Sorry, the delegation has failed.');
    }
  };

  return (
    <div>
      <Modal
        title={modalText?.title}
        visible={showModal}
        onCancel={() => resetModal()}
        steps={modalText.steps}
        description={modalText.description}
        content={
          requireTokenApproval ? (
            <ModalApproveToken onSubmit={() => hasAllowance.refetch()} />
          ) : (
            <ModalInput
              inputTitle={modalText.inputTitle}
              submitText={modalText.submitText}
              onSubmit={(amount: number) => onSubmit(indexerAddress, amount)}
              isLoading={isLoading}
              curAmount={account ? balance : undefined}
              showMaxButton
            />
          )
        }
      />
      <ModalStatus
        visible={!!(errorModalText || successModalText)}
        errorText={errorModalText}
        onCancel={resetModalStatus}
        error={!!errorModalText}
        success={!!successModalText}
      />
      <Button
        label={t('delegate.title')}
        onClick={() => handleBtnClick()}
        className={styles.btn}
        size="small"
        disabled={hasAllowance.loading}
      />
    </div>
  );
};
