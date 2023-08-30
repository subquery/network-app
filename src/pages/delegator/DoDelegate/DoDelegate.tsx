// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  claimIndexerRewardsModalText,
  ModalApproveToken,
  ModalClaimIndexerRewards,
  tokenApprovalModalText,
  WalletRoute,
} from '@components';
import TransactionModal from '@components/TransactionModal';
import { idleText } from '@components/TransactionModal/TransactionModal';
import { useSQToken, useWeb3 } from '@containers';
import { formatEther, parseEther } from '@ethersproject/units';
import { useEra } from '@hooks';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { useIsLogin } from '@hooks/useIsLogin';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/components';
import { DelegationFieldsFragment, IndexerFieldsFragment } from '@subql/network-query';
import { convertStringToNumber, mergeAsync, parseError, renderAsync } from '@utils';
import { Button } from 'antd';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

import { DelegateForm } from './DelegateFrom';

const getModalText = (requireClaimIndexerRewards = false, requireTokenApproval = false, t: TFunction) => {
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
  delegation?: DelegationFieldsFragment | null;
  indexer?: IndexerFieldsFragment | null;
}

export const DoDelegate: React.FC<DoDelegateProps> = ({ indexerAddress, variant, delegation, indexer }) => {
  const { t } = useTranslation();
  const { currentEra, refetch } = useEra();
  const { account } = useWeb3();
  const { contracts } = useWeb3Store();
  const { stakingAllowance } = useSQToken();
  const requireTokenApproval = stakingAllowance?.data?.isZero();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);
  const isLogin = useIsLogin();

  const handleClick = async ({ input, delegator }: { input: number; delegator?: string }) => {
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(input.toString());
    if (delegator && delegator !== account) {
      return contracts.stakingManager.redelegate(delegator, indexerAddress, delegateAmount);
    }

    return contracts.stakingManager.delegate(indexerAddress, delegateAmount);
  };

  if (!account) {
    return (
      <Button disabled type="text">
        {t('delegate.title')}
      </Button>
    );
  }

  return renderAsync(mergeAsync(rewardClaimStatus, currentEra), {
    error: (error) => (
      <Typography>
        {`Error: Click to `}
        <span
          onClick={() => {
            rewardClaimStatus.refetch();
            refetch();
          }}
          style={{ color: 'var(--sq-blue600)' }}
        >
          retry
        </span>
      </Typography>
    ),
    loading: () => <Spinner />,
    data: (data) => {
      const [r, era] = data;
      const requireClaimIndexerRewards = !r?.hasClaimedRewards;
      // if doesn't login will enter wallerRoute logical code process
      const isActionDisabled = isLogin ? !stakingAllowance.data || rewardClaimStatus.loading : false;

      let afterDelegatedAmount = 0;
      let indexerCapacity = BigNumber.from(0);
      if (delegation?.amount) {
        const rawDelegate = parseRawEraValue(delegation?.amount, era?.index);
        const delegate = mapEraValue(rawDelegate, (v) => convertStringToNumber(formatEther(v ?? 0)));
        afterDelegatedAmount = delegate.after ?? 0;
      }

      if (indexer?.capacity) {
        const rawCapacity = parseRawEraValue(indexer?.capacity, era?.index);

        indexerCapacity = rawCapacity.after ?? BigNumber.from(0);
      }

      const modalText = isLogin ? getModalText(requireClaimIndexerRewards, requireTokenApproval, t) : idleText;

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
            if (!isLogin) {
              return <WalletRoute componentMode element={<></>}></WalletRoute>;
            }
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
                delegatedAmount={afterDelegatedAmount}
                indexerCapacity={indexerCapacity}
                indexerMetadataCid={indexer?.metadata}
                error={error}
                curEra={era?.index}
              />
            );
          }}
          variant={isActionDisabled ? 'disabledTextBtn' : variant}
          initialCheck={rewardClaimStatus}
          width="540px"
        />
      );
    },
  });
};
