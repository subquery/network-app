// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { gql, useLazyQuery } from '@apollo/client';
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
import { useGetDelegationLazyQuery } from '@subql/react-hooks';
import { convertStringToNumber, renderAsync } from '@utils';
import { retry } from '@utils/retry';
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
  btnText?: string;
}

export const DoDelegate: React.FC<DoDelegateProps> = ({ indexerAddress, variant, delegation, indexer, btnText }) => {
  const { t } = useTranslation();
  const { currentEra, refetch } = useEra();
  const { account } = useWeb3();
  const { contracts } = useWeb3Store();
  const { stakingAllowance } = useSQToken();
  const requireTokenApproval = useMemo(() => stakingAllowance?.result.data?.isZero(), [stakingAllowance?.result.data]);
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);

  // note why we don't use useGetIndexerLazy.
  // In apollo-client, if two different query use same fragment, and the query result in the two query is different,
  //  the two query result will both update.
  //  so, when we have used useGetIndexers in this component's parent component,
  //  if we use useGetIndexerLazy in here, the parent component will also update.
  //  it's not a clear flow to do update.
  //  explicitly update would be better.
  const [getIndexerLazy, indexerDataLazy] = useLazyQuery(
    gql`
      query GetIndexer($address: String!) {
        indexer(id: $address) {
          capacity
        }
      }
    `,
    {
      variables: {
        address: indexerAddress,
      },
      fetchPolicy: 'network-only',
    },
  );
  const [getDelegationLazy, delegationDataLazy] = useGetDelegationLazyQuery({
    variables: {
      id: `${account}:${indexerAddress}`,
    },
    fetchPolicy: 'network-only',
  });
  const [requireClaimIndexerRewards, setRequireClaimIndexerRewards] = React.useState(true);
  const [fetchRequireClaimIndexerRewardsLoading, setFetchRequireClaimIndexerRewardsLoading] = React.useState(false);
  const isLogin = useIsLogin();

  const modalText = useMemo(() => {
    return isLogin ? getModalText(requireClaimIndexerRewards, requireTokenApproval, t) : idleText;
  }, [isLogin, requireClaimIndexerRewards, requireTokenApproval]);

  const afterDelegatedAmount = useMemo(() => {
    let afterDelegatedAmount = 0;
    const fetchedDelegatedAmount = delegationDataLazy.data
      ? delegationDataLazy.data.delegation?.amount
      : delegation?.amount;

    if (fetchedDelegatedAmount) {
      const rawDelegate = parseRawEraValue(fetchedDelegatedAmount, currentEra.data?.index);
      const delegate = mapEraValue(rawDelegate, (v) => convertStringToNumber(formatEther(v ?? 0)));
      afterDelegatedAmount = delegate.after ?? 0;
    }
    return afterDelegatedAmount;
  }, [currentEra, delegation, delegationDataLazy.data?.delegation?.amount]);

  const indexerCapacity = useMemo(() => {
    let indexerCapacity = BigNumber.from(0);
    const fetchedCapacity = indexerDataLazy.data ? indexerDataLazy.data.indexer?.capacity : indexer?.capacity;
    if (fetchedCapacity) {
      const rawCapacity = parseRawEraValue(fetchedCapacity, currentEra.data?.index);

      indexerCapacity = rawCapacity.after ?? BigNumber.from(0);
    }

    return indexerCapacity;
  }, [indexer, indexerDataLazy, currentEra]);

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

  return renderAsync(currentEra, {
    error: (error) => (
      <Typography>
        {`Error: Click to `}
        <span
          onClick={() => {
            refetch();
          }}
          style={{ color: 'var(--sq-blue600)', cursor: 'pointer' }}
        >
          retry
        </span>
      </Typography>
    ),
    loading: () => <Spinner />,
    data: (era) => {
      // if doesn't login will enter wallerRoute logical code process
      const isActionDisabled = isLogin ? !stakingAllowance.result.data : false;

      return (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: btnText || t('delegate.title'),
              key: 'delegate',
              disabled: fetchRequireClaimIndexerRewardsLoading || isActionDisabled,
              rightItem: fetchRequireClaimIndexerRewardsLoading ? (
                <Spinner size={10} color="var(--sq-gray500)" />
              ) : undefined,
              onClick: async () => {
                try {
                  setFetchRequireClaimIndexerRewardsLoading(true);

                  if (!indexer) {
                    await getIndexerLazy();
                  }

                  if (!delegation) {
                    await getDelegationLazy();
                  }

                  const res = await rewardClaimStatus.refetch();
                  setRequireClaimIndexerRewards(!res);
                } finally {
                  setFetchRequireClaimIndexerRewardsLoading(false);
                }
              },
            },
          ]}
          onSuccess={() => {
            retry(() => {
              getDelegationLazy();
              getIndexerLazy();
            });
          }}
          onClick={handleClick}
          renderContent={(onSubmit, onCancel, _, error) => {
            if (!isLogin) {
              return <WalletRoute componentMode element={<></>}></WalletRoute>;
            }
            if (requireClaimIndexerRewards) {
              return (
                <ModalClaimIndexerRewards
                  onSuccess={async () => {
                    const res = await rewardClaimStatus.refetch();
                    setRequireClaimIndexerRewards(!res);
                  }}
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
          width="540px"
        />
      );
    },
  });
};
