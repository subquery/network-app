// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from 'react-i18next';
import { ApproveContract, ModalApproveToken, tokenApprovalModalText } from '@components/ModalApproveToken';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { parseEther } from '@ethersproject/units';
import { useAsyncMemo } from '@hooks/useAsyncMemo';
import { Spinner, Typography } from '@subql/components';
import { formatSQT, renderAsync } from '@subql/react-hooks';
import assert from 'assert';
import { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

import { Form } from './Form';

const modalText = (requireTokenApproval = false, t: TFunction) => {
  if (requireTokenApproval) return tokenApprovalModalText;
  return {
    title: 'Undelegate from Pool',
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')], // TODO change if the user needs to approve first
    inputTitle: t('delegate.delegateAmount'),
    submitText: t('delegate.confirmDelegate'),
    failureText: t('delegate.delegateFailure'),
    successText: t('delegate.delegateSuccess'),
  };
};

export function Undelegate() {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const { account } = useWeb3();

  const poolAllowance = useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.delegationPool.address);
  }, [account, contracts]);

  const handleClick = async ({ amount }: { amount: string }) => {
    assert(contracts, 'Delegation pool not available');

    const sqtAmount = parseEther(amount);
    return contracts.delegationPool.undelegate(sqtAmount);
  };

  const handleSuccess = () => {
    // TODO display notification, reload any other data that needs reloading
  };

  const poolBalance = useAsyncMemo(async () => {
    const bal = await contracts?.delegationPool.balanceOf(account!);

    return bal ? formatSQT(bal.toBigInt()) : '0';
  }, [account, contracts]);

  return (
    <TransactionModal
      loading={false}
      showSuccessModal={false}
      text={modalText(poolAllowance.data?.isZero(), t)}
      actions={[
        {
          label: t('delegate.undelegate'),
          key: 'undelegate',
          disabled: poolBalance.data === '0', // TODO disable if 0 SQT balance
          onClick: () => {
            // TODO reload any data after delegation
          },
        },
      ]}
      onClick={handleClick}
      onSuccess={handleSuccess}
      width="540px"
      renderContent={(onSubmit, onCancel, _, error) => {
        return <Form sqtBalance={poolBalance.data} onSubmit={onSubmit} />;
      }}
    />
  );
}
