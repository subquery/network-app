// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsExclamationCircle } from 'react-icons/bs';
import ExclamationCircleFilled from '@ant-design/icons/ExclamationCircleFilled';
import InfoCircleOutlined from '@ant-design/icons/InfoCircleOutlined';
import { gql, useLazyQuery } from '@apollo/client';
import { claimIndexerRewardsModalText, ModalClaimIndexerRewards, ModalInput } from '@components';
import { useMakeNotification } from '@components/NotificationCentre/useMakeNotification';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { useEra, useLockPeriod } from '@hooks';
import { mapEraValue, parseRawEraValue } from '@hooks/useEraValue';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Spinner, Typography } from '@subql/components';
import { useGetDelegationQuery } from '@subql/react-hooks';
import { formatEther, TOKEN } from '@utils';
import { convertStringToNumber, mergeAsync, renderAsync } from '@utils';
import { Alert, Divider, Tooltip } from 'antd';
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
  showBtnIfDisabled?: boolean;
  variant?: 'button' | 'textBtn';
  initialUndelegateWay?: 'myWallet' | 'anotherIndexer';
  onSuccess?: () => void;
}

/**
 *
 * NOTE: USED Under Stake Tab and Delegator Tab(V2)
 * TODO: review once container upgrade from renovation
 */
export const DoUndelegate: React.FC<DoUndelegateProps> = ({
  indexerAddress,
  initialUndelegateWay = 'myWallet',
  onSuccess,
  variant = 'textBtn',
  showBtnIfDisabled = false,
}) => {
  const { account: connectedAccount } = useWeb3();
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);
  const waitTransactionHandled = useWaitTransactionhandled();
  const lockPeriod = useLockPeriod();
  const filterParams = { id: `${connectedAccount ?? ''}:${indexerAddress}` };
  const delegation = useGetDelegationQuery({ variables: filterParams, pollInterval: 10000 });

  const { refreshAndMakeInactiveOperatorNotification } = useMakeNotification();

  const [getIndexerLazy, indexerDataLazy] = useLazyQuery(
    gql`
      query GetIndexer($address: String!) {
        indexer(id: $address) {
          capacity
          metadata
          active
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

  const [undelegateWay, setUndelegateWay] = React.useState<'myWallet' | 'anotherIndexer'>(initialUndelegateWay);

  const afterDelegatedAmount = React.useMemo(() => {
    let afterDelegatedAmount = '0';
    const fetchedDelegatedAmount = delegation.data?.delegation?.amount;

    if (fetchedDelegatedAmount) {
      const rawDelegate = parseRawEraValue(fetchedDelegatedAmount, currentEra.data?.index);
      const delegate = mapEraValue(rawDelegate, (v) => formatEther(v ?? 0, 0));

      afterDelegatedAmount = delegate.after ?? '0';
    }
    return afterDelegatedAmount;
  }, [currentEra, delegation.data?.delegation?.amount]);

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
    error: (error) => {
      return '';
    },
    loading: () => <Spinner />,
    data: (data) => {
      const [indexerRewards, lock, targetDelegation] = data;
      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;
      const availableBalance = formatEther(targetDelegation?.delegation?.amount?.valueAfter?.value ?? '0');
      const hasBalanceForNextEra = parseEther(availableBalance ?? '0').gt('0');
      const disabled = !hasBalanceForNextEra;
      const tooltip = !hasBalanceForNextEra ? t('delegate.nonToUndelegate') : '';

      const modalText = getModalText(requireClaimIndexerRewards, lock, t);
      const actions =
        !disabled || showBtnIfDisabled
          ? [
              {
                label: undelegateWay === 'myWallet' ? 'Undelegate to wallet' : 'Redelegate to other',
                key: 'undelegate',
                disabled,
                tooltip,
                onClick: async () => {
                  await getIndexerLazy();
                },
              },
            ]
          : [];
      return (
        <TransactionModal
          variant={disabled ? 'disabledTextBtn' : variant}
          text={modalText}
          actions={actions}
          onClick={handleClick}
          onSuccess={async (_, receipt) => {
            await waitTransactionHandled(receipt?.blockNumber);
            await onSuccess?.();
            refreshAndMakeInactiveOperatorNotification();
          }}
          renderContent={(onSubmit, onCancel, loading, error) => {
            // if operator is not active, skip collect.
            if (requireClaimIndexerRewards && indexerDataLazy.data?.indexer?.active === true) {
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
                {undelegateWay === 'myWallet' && (
                  <>
                    <Alert
                      showIcon
                      type="warning"
                      style={{
                        border: '1px solid #F87C4F80',
                        background: '#F87C4F14',
                        alignItems: 'flex-start',
                      }}
                      icon={<ExclamationCircleFilled style={{ color: 'var(--sq-warning)', marginTop: 4 }} />}
                      message={
                        <div
                          className="col-flex"
                          style={{
                            gap: 16,
                          }}
                        >
                          <Typography>
                            Tokens will be undelegated from next era. During the undelegation period the wont earn any
                            rewards and will then be locked for {hours} hours before you can withdraw them.
                          </Typography>
                          <Typography>
                            Note, you can instead{' '}
                            <Typography.Link
                              type="info"
                              style={{ textDecoration: 'underline' }}
                              onClick={() => {
                                setUndelegateWay('anotherIndexer');
                              }}
                            >
                              redelegate
                            </Typography.Link>{' '}
                            to another Node Operator without waiting for an undelegation period or missing out on
                            rewards.
                          </Typography>
                        </div>
                      }
                    ></Alert>

                    <Divider />
                  </>
                )}

                {undelegateWay === 'anotherIndexer' && (
                  <Alert
                    showIcon
                    type="info"
                    style={{
                      border: '1px solid #3AA0FF80',
                      background: '#3AA0FF14',
                      alignItems: 'flex-start',
                      marginBottom: 24,
                    }}
                    icon={<InfoCircleOutlined style={{ color: 'var(--sq-info)', marginTop: 4 }} />}
                    message={
                      <div
                        className="col-flex"
                        style={{
                          gap: 16,
                        }}
                      >
                        <Typography>
                          Select the node operator you want to redelegate from the dropdown. The redelegation process is
                          automatically applied at the end of the current Era, and you will not miss out on any rewards.
                        </Typography>
                      </div>
                    }
                  ></Alert>
                )}

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
                      indexerCapacity={BigNumber.from(0)} // unused when style === reDelegate
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
