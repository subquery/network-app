// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button, Typography } from 'antd';
import assert from 'assert';
import { BigNumber, constants, ContractReceipt, ContractTransaction } from 'ethers';

import { useWeb3Store } from 'src/stores';

import i18next from '../../i18n';
import { parseError, TOKEN } from '../../utils';
import styles from './ModalApproveToken.module.css';

export const getTokenApprovalModalText = (token = TOKEN) => ({
  title: i18next.t('tokenApproval.approve', { token }),
  description: i18next.t('tokenApproval.approveToProceed', { token }),
  submitText: i18next.t('tokenApproval.confirm'),
  steps: [i18next.t('general.confirm'), i18next.t('general.confirmOnMetamask')],
  failureText: `Sorry, ${token} token approval has failed.`,
});

export const tokenApprovalModalText = getTokenApprovalModalText();
export enum ApproveContract {
  Staking = 'staking',
  PlanManager = 'planManager',
  PurchaseOfferMarket = 'purchaseOfferMarket',
  ConsumerHost = 'consumerHost',
  RewardsBooster = 'rewardsBooster',
}

interface ModalApproveTokenProps {
  isLoading?: boolean;
  submitText?: string;
  onSuccess?: () => void;
  onFail?: () => void;
  onSubmit?: () => void;
  contract?: ApproveContract;
  onIncreaseAllowance?: (address: string, allowance: BigNumber) => Promise<ContractTransaction>;
  increaseAllowanceAmount?: BigNumber;
}

export const ModalApproveToken: React.FC<ModalApproveTokenProps> = ({
  submitText,
  onFail,
  onSuccess,
  onSubmit,
  contract = ApproveContract.Staking,
  onIncreaseAllowance,
  increaseAllowanceAmount,
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>();
  const { contracts } = useWeb3Store();
  const onApproveToken = async () => {
    try {
      setIsLoading(true);
      assert(contracts, 'Contracts not available');

      let approvalTxResult: ContractReceipt;

      // TODO: put totalSupply
      if (onIncreaseAllowance) {
        const approvalTx = await onIncreaseAllowance(
          contracts[contract].address,
          increaseAllowanceAmount ?? BigNumber.from('0'),
        );
        approvalTxResult = await approvalTx.wait();
      } else {
        try {
          const approvalTx = await contracts.sqToken.increaseAllowance(
            contracts[contract].address,
            constants.MaxUint256,
          );
          approvalTxResult = await approvalTx.wait();
        } catch (e) {
          const approvalTx = await contracts.sqToken.approve(contracts[contract].address, constants.MaxUint256);
          approvalTxResult = await approvalTx.wait();
        }
      }

      if (approvalTxResult.status === 1) {
        onSuccess && onSuccess();
        onSubmit && onSubmit();
      } else {
        onFail && onFail();
        onSubmit && onSubmit();
      }
    } catch (error) {
      setError(parseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && <Typography.Paragraph type="danger">{error}</Typography.Paragraph>}
      <div className={styles.btnContainer}>
        <Button
          shape="round"
          size="large"
          className={styles.submitBtn}
          loading={isLoading}
          disabled={isLoading}
          onClick={onApproveToken}
        >
          {submitText || 'Confirm Approval'}
        </Button>
      </div>
    </>
  );
};
