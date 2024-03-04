// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationCircle } from 'react-icons/bs';
import { gql, useLazyQuery } from '@apollo/client';
import { claimIndexerRewardsModalText, ModalClaimIndexerRewards, ModalInput } from '@components';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { useEra, useLockPeriod } from '@hooks';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/components';
import { useGetDelegationQuery } from '@subql/react-hooks';
import { formatEther, TOKEN } from '@utils';
import { convertStringToNumber, mergeAsync, renderAsync } from '@utils';
import { Divider, Radio, Tooltip } from 'antd';
import assert from 'assert';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { TFunction } from 'i18next';
import { isString } from 'lodash-es';

import { useWeb3Store } from 'src/stores';

import { DelegateForm } from '../DoDelegate/DelegateFrom';

const getModalText = (requireClaimIndexerRewards = false, lockPeriod: number | undefined, t: TFunction) => {
  if (requireClaimIndexerRewards) return claimIndexerRewardsModalText;

  return {
    title: t('delegate.undelegate'),
    steps: [t('delegate.undelegate'), t('indexer.confirmOnMetamask')],
  };
};

interface DoUndelegateProps {
  indexerAddress: string;
  variant?: 'button' | 'textBtn';
  onSuccess?: () => void;
}

/**
 *
 * NOTE: USED Under Stake Tab and Delegator Tab(V2)
 * TODO: review once container upgrade from renovation
 */
export const DoUndelegate: React.FC<DoUndelegateProps> = ({ indexerAddress, onSuccess, variant = 'textBtn' }) => {
  const { account: connectedAccount } = useWeb3();
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);
  const lockPeriod = useLockPeriod();
  const filterParams = { id: `${connectedAccount ?? ''}:${indexerAddress}` };
  const delegation = useGetDelegationQuery({ variables: filterParams, pollInterval: 10000 });
  const [getIndexerLazy, indexerDataLazy] = useLazyQuery(
    gql`
      query GetIndexer($address: String!) {
        indexer(id: $address) {
          capacity
          metadata
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
  const { currentEra } = useEra();

  const [undelegateWay, setUndelegateWay] = React.useState<'myWallet' | 'anotherIndexer'>('myWallet');

  const afterDelegatedAmount = React.useMemo(() => {
    let afterDelegatedAmount = 0;
    const fetchedDelegatedAmount = delegation.data?.delegation?.amount;

    if (fetchedDelegatedAmount) {
      const rawDelegate = parseRawEraValue(fetchedDelegatedAmount, currentEra.data?.index);
      const delegate = mapEraValue(rawDelegate, (v) => convertStringToNumber(formatEther(v ?? 0)));
      afterDelegatedAmount = delegate.after ?? 0;
    }
    return afterDelegatedAmount;
  }, [currentEra, delegation.data?.delegation?.amount]);

  const indexerCapacity = React.useMemo(() => {
    let indexerCapacity = BigNumber.from(0);
    const fetchedCapacity = indexerDataLazy.data?.indexer?.capacity;
    if (fetchedCapacity) {
      const rawCapacity = parseRawEraValue(fetchedCapacity, currentEra.data?.index);

      indexerCapacity = rawCapacity.after ?? BigNumber.from(0);
    }

    return indexerCapacity;
  }, [indexerDataLazy.data, currentEra]);

  const handleClick = async (amount: string | { input: string; delegator: string }) => {
    assert(contracts, 'Contracts not available');
    const amountVal = isString(amount) ? parseEther(amount) : parseEther(amount.input);
    if (undelegateWay === 'myWallet') {
      const pendingTx = contracts.stakingManager.undelegate(indexerAddress, amountVal);
      return pendingTx;
    }
    // if reache this code, the type of amount should be { input: string; delegator: string }
    const toAddress = isString(amount) ? '' : amount.delegator;

    const pendingTx = contracts.stakingManager.redelegate(indexerAddress, toAddress, amountVal);
    return pendingTx;
  };

  return renderAsync(mergeAsync(rewardClaimStatus, lockPeriod, delegation), {
    error: (error) => <Typography>{`Error: ${error}`}</Typography>,
    loading: () => <Spinner />,
    data: (data) => {
      const [indexerRewards, lock, targetDelegation] = data;
      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;
      const availableBalance = formatEther(targetDelegation?.delegation?.amount?.valueAfter?.value ?? '0');
      const hasBalanceForNextEra = parseEther(availableBalance ?? '0').gt('0');
      const disabled = !hasBalanceForNextEra;
      const tooltip = !hasBalanceForNextEra ? t('delegate.nonToUndelegate') : '';

      const modalText = getModalText(requireClaimIndexerRewards, lock, t);
      return (
        <TransactionModal
          variant={disabled ? 'disabledTextBtn' : variant}
          text={modalText}
          actions={
            disabled
              ? []
              : [
                  {
                    label: t('delegate.undelegate'),
                    key: 'undelegate',
                    disabled,
                    tooltip,
                    onClick: async () => {
                      getIndexerLazy();
                    },
                  },
                ]
          }
          onClick={handleClick}
          onSuccess={() => {
            onSuccess?.();
          }}
          renderContent={(onSubmit, onCancel, loading, error) => {
            if (requireClaimIndexerRewards) {
              return (
                <ModalClaimIndexerRewards
                  onSuccess={() => rewardClaimStatus.refetch()}
                  indexer={indexerAddress ?? ''}
                />
              );
            }
            const hours = dayjs
              .duration(+(lock || 0), 'seconds')
              .as('hours')
              .toPrecision(3);
            return (
              <div>
                <Typography variant="medium">
                  {t('delegate.undelegateValidNextEra', {
                    duration: `${hours} hours`,
                  })}
                </Typography>
                <Radio.Group
                  value={undelegateWay}
                  onChange={(e) => setUndelegateWay(e.target.value)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '24px 0 0 0' }}
                >
                  <Radio value={'myWallet'}>Undelegate to my wallet ( with {hours}hr unlocking period )</Radio>
                  <Radio value={'anotherIndexer'}>Redelegate to another Indexer (immediately at next era)</Radio>
                </Radio.Group>

                <Divider />

                {undelegateWay === 'myWallet' && (
                  <div className="col-flex" style={{ gap: 8 }}>
                    <Typography>Enter the amount of {TOKEN} you want to undelegate</Typography>

                    <ModalInput
                      onSubmit={onSubmit}
                      showMaxButton
                      stringMode
                      curAmount={availableBalance}
                      max={convertStringToNumber(availableBalance ?? '0')}
                      description={`Your Existing Delegation: ${convertStringToNumber(
                        availableBalance ?? '0',
                      )} ${TOKEN}`}
                      submitText="Undelegate"
                      isLoading={loading}
                    ></ModalInput>
                  </div>
                )}

                {undelegateWay === 'anotherIndexer' && (
                  <div>
                    <Typography style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      Redelegate to
                      <Tooltip title="Choose a indexer to redelegate. You can either scroll through the list or use the search bar to find a specific indexer.">
                        <BsExclamationCircle style={{ fontSize: 14, color: 'var(--sq-gray500)' }}></BsExclamationCircle>
                      </Tooltip>
                    </Typography>

                    <DelegateForm
                      onSubmit={onSubmit}
                      onCancel={onCancel}
                      indexerAddress={indexerAddress}
                      delegatedAmount={afterDelegatedAmount}
                      indexerCapacity={indexerCapacity}
                      indexerMetadataCid={indexerDataLazy.data?.metadata}
                      error={error}
                      curEra={currentEra.data?.index}
                      styleMode="reDelegate"
                    />
                  </div>
                )}
              </div>
            );
          }}
        />
      );
    },
  });
};
