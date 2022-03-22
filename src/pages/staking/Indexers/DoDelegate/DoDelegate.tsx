// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { formatEther, parseEther } from '@ethersproject/units';
import { useTranslation } from 'react-i18next';
import { useContracts, useSQToken, useWeb3 } from '../../../../containers';
import { tokenApprovalModalText, ModalApproveToken } from '../../../../components';
import TransactionModal from '../../../../components/TransactionModal';
import { convertBigNumberToNumber, convertStringToNumber } from '../../../../utils';
import { useAsyncMemo } from '../../../../hooks';

interface DoDelegateProps {
  indexerAddress: string;
  variant?: 'button' | 'textBtn' | 'errTextBtn' | 'errButton';
}

export const DoDelegate: React.VFC<DoDelegateProps> = ({ indexerAddress, variant }) => {
  const { t } = useTranslation();
  const { account, library } = useWeb3();
  const pendingContracts = useContracts();
  const { balance, stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();
  const accountBalance = useAsyncMemo(async () => await library?.getBalance(account || ''), [account]);
  console.log('account available balance', formatEther(accountBalance?.data ?? 0));
  console.log('contract balance', convertBigNumberToNumber(balance?.data ?? 0));
  console.log('stakingAllowance', formatEther(stakingAllowance?.data ?? 0));

  //TODO: define the returnType wen tokenApproval UI confirm
  const modalText = requireTokenApproval
    ? tokenApprovalModalText
    : {
        title: t('delegate.title'),
        steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
        description: t('delegate.delegateValidNextEra'),
        inputTitle: t('delegate.delegateAmount'),
        submitText: t('delegate.confirmDelegate'),
        failureText: 'Sorry, delegation failed',
      };

  const handleClick = async (amount: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(amount.toString());
    return contracts.staking.delegate(indexerAddress, delegateAmount);
  };

  return (
    <TransactionModal
      text={modalText}
      actions={[{ label: t('delegate.title'), key: 'delegate', disabled: !stakingAllowance.data }]}
      onClick={handleClick}
      inputParams={{
        showMaxButton: true,
        curAmount: account ? convertStringToNumber(formatEther(accountBalance.data ?? 0)) : undefined,
      }}
      renderContent={() => {
        return !!requireTokenApproval && <ModalApproveToken onSubmit={() => stakingAllowance.refetch()} />;
      }}
      variant={variant}
    />
  );
};
