// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { assert } from '@polkadot/util';
import { openNotification } from '@subql/components';
import { parseEther } from 'ethers/lib/utils';

import { useWeb3Store } from 'src/stores';

import { useSQToken } from '../../containers';
import { formatEther, TOKEN } from '../../utils';
import { ApproveContract, ModalApproveToken } from '../ModalApproveToken';
import TransactionModal from '../TransactionModal';

type TransferAction = 'Transfer' | 'Withdraw';

export const BillingExchangeModal = ({ action }: { action: TransferAction }) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const { consumerHostAllowance, balance, consumerHostBalance } = useSQToken();
  const sortedBalance = balance.result.data;
  const sortedConsumerHostBalance = consumerHostBalance.result.data?.balance;
  const requireTokenApproval = consumerHostAllowance?.result.data?.isZero();
  const [loadingIncreateAllowance, setLoadingIncreateAllowance] = useState(false);
  const getModalText = (action: TransferAction) => {
    if (action === 'Transfer') {
      return {
        title: t('myFlexPlans.billing.transfer'),
        steps: [t('myFlexPlans.billing.addToken'), t('myFlexPlans.billing.confirmTransfer')],
        description: t('myFlexPlans.billing.transferDescription'),
        inputTitle: t('myFlexPlans.billing.confirmTransfer'),
        submitText: t('myFlexPlans.billing.confirmTransfer'),
        failureText: t('myFlexPlans.billing.failureTransfer'),
        successText: t('myFlexPlans.billing.successTransfer'),
      };
    }

    return {
      title: t('myFlexPlans.billing.withdrawToken'),
      steps: [t('myFlexPlans.billing.withdrawToken'), t('myFlexPlans.billing.confirmWithdraw')],
      inputTitle: t('myFlexPlans.billing.withdrawTitle'),
      inputBottomText: `Current Billing balance: ${formatEther(sortedConsumerHostBalance, 4)} ${TOKEN}`,
      submitText: t('myFlexPlans.billing.withdrawToken'),
      failureText: t('myFlexPlans.billing.failureWithdraw'),
      successText: t('myFlexPlans.billing.successWithdraw'),
    };
  };

  const getActionBtn = (action: TransferAction) => {
    return action === 'Transfer'
      ? {
          label: t('myFlexPlans.billing.transferToken'),
          key: 'billingTransfer',
        }
      : {
          label: t('myFlexPlans.billing.withdrawToken'),
          key: 'billingWithdrawn',
          disabled: !!sortedConsumerHostBalance?.isZero(),
        };
  };

  const getMaxAmount = (action: TransferAction) => {
    return action === 'Transfer' ? formatEther(sortedBalance) : formatEther(sortedConsumerHostBalance);
  };

  const handleClick = async (amount: string) => {
    assert(contracts, 'Contracts not available');
    const sortedAmount = parseEther(amount.toString());

    if (action === 'Transfer') {
      if (consumerHostAllowance?.result.data?.lt(sortedAmount)) {
        setLoadingIncreateAllowance(true);
        try {
          openNotification({
            type: 'info',
            description: 'Allowance not enough, increase allowance first',
            duration: 5000,
          });
          const tx = await contracts.sqToken.increaseAllowance(
            contracts[ApproveContract.ConsumerHost].address,
            sortedAmount,
          );
          await tx.wait();
        } finally {
          setLoadingIncreateAllowance(false);
        }
      }
      return contracts.consumerHost.deposit(sortedAmount, true);
    }

    return contracts.consumerHost.withdraw(sortedAmount);
  };

  return (
    <TransactionModal
      currentConfirmButtonLoading={loadingIncreateAllowance}
      text={getModalText(action)}
      actions={[getActionBtn(action)]}
      onClick={handleClick}
      inputParams={{
        showMaxButton: true,
        curAmount: getMaxAmount(action),
      }}
      onSuccess={() => {
        consumerHostBalance.refetch();
        balance.refetch();
      }}
      variant={'textBtn'}
      renderContent={(onSubmit, onCancel, isLoading, error) => {
        if (requireTokenApproval && action === 'Transfer') {
          return (
            <ModalApproveToken
              onSubmit={() => consumerHostAllowance.refetch()}
              contract={ApproveContract.ConsumerHost}
            />
          );
        }
      }}
    />
  );
};
