// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { utils } from 'ethers';
import i18next from '../../i18n';
import { Button } from 'antd';
import styles from './ModalApproveToken.module.css';
import { useContracts } from '../../containers';

export const tokenApprovalModalText = {
  title: i18next.t('indexer.approveToken'),
  description: i18next.t('delegate.approveTokenToDelegate'),
  submitText: i18next.t('indexer.confirmApproval'),
  inputTitle: '',
  steps: [],
  failureText: `Sorry, SQT token approval has failed.`,
};

interface ModalApproveTokenProps {
  isLoading?: boolean;
  submitText?: string;
  onSuccess?: () => void;
  onFail?: () => void;
  onSubmit?: () => void;
}

export const ModalApproveToken: React.FC<ModalApproveTokenProps> = ({ submitText, onFail, onSuccess, onSubmit }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const pendingContracts = useContracts();
  const onApproveToken = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const approvalTx = await contracts.sqToken.increaseAllowance(contracts.staking.address, utils.parseEther('1000'));
    setIsLoading(true);
    const approvalTxResult = await approvalTx.wait();
    if (approvalTxResult?.status === 1) {
      onSuccess && onSuccess();
      onSubmit && onSubmit();
    } else {
      onFail && onFail();
      onSubmit && onSubmit();
    }
  };

  return (
    <div className={styles.btnContainer}>
      <Button shape="round" size="large" className={styles.submitBtn} loading={isLoading} onClick={onApproveToken}>
        {submitText || 'Confirm Approval'}
      </Button>
    </div>
  );
};
