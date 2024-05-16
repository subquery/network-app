// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
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
import { useEra, useIndexerMetadata } from '@hooks';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { useGetCapacityFromContract } from '@hooks/useGetCapacityFromContract';
import { useIsLogin } from '@hooks/useIsLogin';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { useWeb3Name } from '@hooks/useSpaceId';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { openNotification, Spinner, Typography } from '@subql/components';
import { IndexerFieldsFragment } from '@subql/network-query';
import { mergeAsync, useAsyncMemo, useGetDelegationLazyQuery } from '@subql/react-hooks';
import { convertStringToNumber, renderAsync } from '@utils';
import { Tooltip } from 'antd/lib';
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
  delegation?: { amount: string } | null;
  indexer?: IndexerFieldsFragment | null;
  btnText?: string;
  onSuccess?: () => void;
}

export const DoDelegate: React.FC<DoDelegateProps> = ({
  indexerAddress,
  variant,
  delegation,
  indexer,
  btnText,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { balance, stakingAllowance } = useSQToken();
  const { currentEra, refetch } = useEra();
  const waitTransactionHandled = useWaitTransactionhandled();
  const { account } = useWeb3();
  const { contracts } = useWeb3Store();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress, true);
  const indexerCapacityFromContract = useGetCapacityFromContract(indexerAddress);
  const { indexerMetadata: indexerMetadataIpfs } = useIndexerMetadata(indexerAddress);
  const { fetchWeb3NameFromCache } = useWeb3Name();

  const indexerMetadata = useAsyncMemo(async () => {
    const web3Name = await fetchWeb3NameFromCache(indexerAddress);
    return {
      name: web3Name || indexerMetadataIpfs?.name || indexerAddress,
    };
  }, [indexerMetadataIpfs?.name, indexerAddress]);

  const [getDelegationLazy, delegationDataLazy] = useGetDelegationLazyQuery({
    variables: {
      id: `${account}:${indexerAddress}`,
    },
    fetchPolicy: 'network-only',
  });

  const [requireClaimIndexerRewards, setRequireClaimIndexerRewards] = React.useState(true);
  const [requireTokenApproval, setRequireTokenApproval] = React.useState(false);
  const [shouldFetchStatus, setShouldFetchStatus] = React.useState(false);
  const [fetchCheckStatusLoading, setFetchCheckStatusLoading] = React.useState(false);
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
    const fetchedCapacity = indexerCapacityFromContract.data;

    if (fetchedCapacity) {
      indexerCapacity = fetchedCapacity.after ?? BigNumber.from(0);
    } else if (indexer?.capacity) {
      indexerCapacity = BigNumber.from(parseRawEraValue(indexer.capacity, currentEra.data?.index).after ?? 0);
    }

    if (indexerCapacity.lt(0)) return BigNumber.from(0);

    return indexerCapacity;
  }, [indexer, indexerCapacityFromContract, currentEra]);

  const handleClick = async ({ input, delegator }: { input: number; delegator?: string }) => {
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(input.toString());

    if (delegator && delegator !== account) {
      return contracts.stakingManager.redelegate(delegator, indexerAddress, delegateAmount);
    }

    return contracts.stakingManager.delegate(indexerAddress, delegateAmount);
  };

  const fetchCheck = async () => {
    try {
      if (!isLogin) return;
      setShouldFetchStatus(false);
      setFetchCheckStatusLoading(true);
      const approval = await stakingAllowance.refetch();
      setRequireTokenApproval(approval?.data?.isZero() || false);
      if (!delegation) {
        await getDelegationLazy();
      }

      const res = await rewardClaimStatus.refetch();
      setRequireClaimIndexerRewards(!res);
    } finally {
      setFetchCheckStatusLoading(false);
    }
  };

  return renderAsync(mergeAsync(currentEra, indexerCapacityFromContract), {
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
    data: () => {
      const era = currentEra.data;

      const rightItem = () => {
        if (fetchCheckStatusLoading) {
          return <Spinner size={10} color="var(--sq-gray500)" />;
        }
        if (indexerCapacity.isZero()) {
          return (
            <Tooltip title="This node operator has reached its maximum delegation capacity. You must wait for the Node Operator to increase their self stake, or for other Delegators to undelegate from this Node Operator">
              <InfoCircleOutlined style={{ color: 'var(--sq-error)' }} />
            </Tooltip>
          );
        }
        return;
      };
      return (
        <TransactionModal
          loading={fetchCheckStatusLoading}
          showSuccessModal={false}
          text={modalText}
          actions={[
            {
              label: btnText || t('delegate.title'),
              key: 'delegate',
              disabled: indexerCapacity.isZero() || fetchCheckStatusLoading,
              rightItem: rightItem(),
              onClick: fetchCheck,
            },
          ]}
          onSuccess={async (params: { input: number; delegator?: string }, receipt) => {
            await waitTransactionHandled(receipt?.blockNumber);

            await Promise.all([getDelegationLazy(), balance.refetch(), onSuccess?.()]);

            openNotification({
              type: 'success',
              title: 'Success',
              description: `You’ve successfully delegated ${params.input.toString() || '0'} SQT to ${
                indexerMetadata?.data?.name || indexerAddress
              }`,
              duration: 5,
            });
          }}
          onClick={handleClick}
          renderContent={(onSubmit, onCancel, _, error) => {
            if (!isLogin) {
              setTimeout(() => {
                setShouldFetchStatus(true);
              });
              return (
                <WalletRoute
                  componentMode
                  element={<></>}
                  connectWalletStyle={{
                    margin: 0,
                  }}
                ></WalletRoute>
              );
            } else {
              setTimeout(() => {
                setShouldFetchStatus(false);
              });
            }

            if (shouldFetchStatus) {
              setTimeout(() => {
                fetchCheck();
              });
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
                delegatedAmount={`${afterDelegatedAmount}`}
                indexerCapacity={indexerCapacity}
                indexerMetadataCid={indexer?.metadata}
                error={error}
                curEra={era?.index}
              />
            );
          }}
          variant={variant}
          width="540px"
          onlyRenderInner={account ? false : true} // it's kind of weird & comfuse for maintaining, but worked= =.
        />
      );
    },
  });
};
