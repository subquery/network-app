// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { formatEther, parseEther } from '@ethersproject/units';
import { useTranslation } from 'react-i18next';
import { useContracts, useDelegation, useEra, useSQToken, useWeb3 } from '../../../../containers';
import {
  tokenApprovalModalText,
  ModalApproveToken,
  claimIndexerRewardsModalText,
  ModalClaimIndexerRewards,
} from '../../../../components';
import TransactionModal from '../../../../components/TransactionModal';
import { convertStringToNumber, mergeAsync, renderAsync } from '../../../../utils';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/react-ui';
import { mapEraValue, parseRawEraValue } from '../../../../hooks/useEraValue';
import { DelegateForm } from './DelegateFrom';
import { useIndexerCapacity } from '../../../../hooks';

const getModalText = (requireClaimIndexerRewards = false, requireTokenApproval = false, t: any) => {
  if (requireClaimIndexerRewards) return claimIndexerRewardsModalText;

  if (requireTokenApproval) return tokenApprovalModalText;

  return {
    title: t('delegate.title'),
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
    inputTitle: t('delegate.delegateAmount'),
    submitText: t('delegate.confirmDelegate'),
    failureText: t('delegate.delegateFailure'),
    successText: t('delegate.delegateSuccess'),
  };
};

interface DoDelegateProps {
  indexerAddress: string;
  variant?: 'button' | 'textBtn' | 'errTextBtn' | 'errButton';
}

export const DoDelegate: React.VFC<DoDelegateProps> = ({ indexerAddress, variant }) => {
  const { t } = useTranslation();
  const { currentEra } = useEra();
  const { account } = useWeb3();
  const pendingContracts = useContracts();
  const { stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);
  const delegation = useDelegation(account ?? '', indexerAddress);
  const indexerCapacity = useIndexerCapacity(indexerAddress);

  const handleClick = async ({ input, delegator }: { input: number; delegator?: string }) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(input.toString());

    if (delegator && delegator !== account) {
      return contracts.staking.redelegate(delegator, indexerAddress, delegateAmount);
    }

    return contracts.staking.delegate(indexerAddress, delegateAmount);
  };

  return renderAsync(mergeAsync(rewardClaimStatus, delegation, currentEra, indexerCapacity), {
    error: (error) => <Typography>{`Error: ${error}`}</Typography>,
    loading: () => <Spinner />,
    data: (data) => {
      const [r, d, era, capacity] = data;
      const requireClaimIndexerRewards = !r?.hasClaimedRewards;
      const isActionDisabled = !stakingAllowance.data || rewardClaimStatus.loading;

      let curDelegatedAmount = 0;
      if (d?.delegation?.amount) {
        const rawDelegate = parseRawEraValue(d?.delegation?.amount, era?.index);
        const delegate = mapEraValue(rawDelegate, (v) => convertStringToNumber(formatEther(v ?? 0)));
        curDelegatedAmount = delegate.current;
      }

      const modalText = getModalText(requireClaimIndexerRewards, requireTokenApproval, t);

      return (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: t('delegate.title'),
              key: 'delegate',
              disabled: isActionDisabled,
            },
          ]}
          onClick={handleClick}
          renderContent={(onSubmit, onCancel, isLoading, error) => {
            if (requireClaimIndexerRewards) {
              return (
                <ModalClaimIndexerRewards
                  onSuccess={() => rewardClaimStatus.refetch()}
                  indexer={indexerAddress ?? ''}
                />
              );
            }

            if (requireTokenApproval && !requireClaimIndexerRewards) {
              return <ModalApproveToken onSubmit={() => stakingAllowance.refetch()} />;
            }

            return (
              <DelegateForm
                onSubmit={onSubmit}
                onCancel={onCancel}
                indexerAddress={indexerAddress}
                delegatedAmount={curDelegatedAmount}
                indexerCapacity={capacity?.after}
                error={error}
                curEra={era?.index}
              />
            );
          }}
          variant={isActionDisabled ? 'disabledTextBtn' : variant}
          initialCheck={rewardClaimStatus}
        />
      );
    },
  });
};
