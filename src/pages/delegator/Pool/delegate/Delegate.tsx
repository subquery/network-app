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
    title: 'Delegate to Pool',
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')], // TODO change if the user needs to approve first
    inputTitle: t('delegate.delegateAmount'),
    submitText: t('delegate.confirmDelegate'),
    failureText: t('delegate.delegateFailure'),
    successText: t('delegate.delegateSuccess'),
  };
};

export function Delegate() {
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
    return contracts.delegationPool.delegate(sqtAmount);
  };

  const handleSuccess = () => {
    // TODO display notification, reload any other data that needs reloading
  };

  const sqtBalance = useAsyncMemo(async () => {
    const bal = await contracts?.sqToken.balanceOf(account!);

    return bal ? formatSQT(bal.toBigInt()) : '0';
  }, [account, contracts]);

  return (
    <TransactionModal
      loading={false}
      showSuccessModal={false}
      text={modalText(poolAllowance.data?.isZero(), t)}
      actions={[
        {
          label: t('delegate.title'),
          key: 'delegate',
          disabled: sqtBalance.data === '0', // TODO disable if 0 SQT balance
          onClick: () => {
            // TODO reload any data after delegation
          },
        },
      ]}
      onClick={handleClick}
      onSuccess={handleSuccess}
      width="540px"
      renderContent={(onSubmit, onCancel, _, error) => {
        return renderAsync(poolAllowance, {
          loading: () => <Spinner />,
          error: () => (
            <Typography>
              {`Error: Click to `}
              <span
                onClick={() => {
                  poolAllowance.refetch();
                }}
                style={{ color: 'var(--sq-blue600)', cursor: 'pointer' }}
              >
                retry
              </span>
            </Typography>
          ),
          data: (allowance) => {
            if (allowance.isZero()) {
              // This will increase it to the max amount
              // onSubmit is called after tx success on chain
              return (
                <ModalApproveToken
                  contract={ApproveContract.DelegationPool}
                  onSuccess={() => {
                    poolAllowance.refetch();
                    // TODO Refetch allowance for delegation pool
                  }}
                />
              );
            }
            // TODO display current delegation, expected APY, that were delegating to the pool.
            return <Form sqtBalance={sqtBalance.data} onSubmit={onSubmit} />;
          },
        });
      }}
    />
  );
}
