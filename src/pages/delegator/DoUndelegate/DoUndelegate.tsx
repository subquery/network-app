// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { claimIndexerRewardsModalText, ModalClaimIndexerRewards } from '@components';
import TransactionModal from '@components/TransactionModal';
import { useWeb3 } from '@containers';
import { useLockPeriod } from '@hooks';
import { useRewardCollectStatus } from '@hooks/useRewardCollectStatus';
import { Spinner, Typography } from '@subql/components';
import { useGetDelegationQuery } from '@subql/react-hooks';
import { formatEther } from '@utils';
import { convertStringToNumber, mergeAsync, renderAsync } from '@utils';
import assert from 'assert';
import { parseEther } from 'ethers/lib/utils';
import { TFunction } from 'i18next';
import moment from 'moment';

import { useWeb3Store } from 'src/stores';

const getModalText = (requireClaimIndexerRewards = false, lockPeriod: number | undefined, t: TFunction) => {
  if (requireClaimIndexerRewards) return claimIndexerRewardsModalText;

  return {
    title: t('delegate.undelegate'),
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
    description: t('delegate.undelegateValidNextEra', {
      duration: `${moment.duration(lockPeriod, 'seconds').as('hours').toPrecision(3)} hours`,
    }),
    inputTitle: t('delegate.undelegateAmount'),
    submitText: t('delegate.confirmUndelegate'),
    failureText: 'Sorry, fail to undelegate.',
  };
};

interface DoUndelegateProps {
  indexerAddress: string;
  variant?: 'button' | 'textBtn';
}

/**
 *
 * NOTE: USED Under Stake Tab and Delegator Tab(V2)
 * TODO: review once container upgrade from renovation
 */
export const DoUndelegate: React.FC<DoUndelegateProps> = ({ indexerAddress, variant = 'textBtn' }) => {
  const { account: connectedAccount } = useWeb3();
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);
  const lockPeriod = useLockPeriod();
  const filterParams = { id: `${connectedAccount ?? ''}:${indexerAddress}` };
  const delegation = useGetDelegationQuery({ variables: filterParams, pollInterval: 10000 });

  const handleClick = async (amount: string) => {
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(amount.toString());
    const pendingTx = contracts.stakingManager.undelegate(indexerAddress, delegateAmount);

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
                  },
                ]
          }
          inputParams={{
            showMaxButton: true,
            stringMode: true,
            curAmount: availableBalance,
            max: convertStringToNumber(availableBalance ?? '0'),
          }}
          onClick={handleClick}
          renderContent={(onSubmit, _, loading) => {
            if (requireClaimIndexerRewards) {
              return (
                <ModalClaimIndexerRewards
                  onSuccess={() => rewardClaimStatus.refetch()}
                  indexer={indexerAddress ?? ''}
                />
              );
            }
          }}
        />
      );
    },
  });
};
