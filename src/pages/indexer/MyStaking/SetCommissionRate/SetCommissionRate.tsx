// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3 } from '../../../../containers';
import TransactionModal from '../../../../components/TransactionModal';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { mergeAsync, renderAsyncArray } from '../../../../utils';
import { Spinner, Typography } from '@subql/react-ui';
import { COMMISSION_DIV_UNIT, useCommissionRate } from '../../../../hooks/useCommissionRate';
import { claimIndexerRewardsModalText, ModalClaimIndexerRewards } from '../../../../components';

const getModalText = (requireClaimIndexerRewards = false, commissionRate: string | undefined, t: any) => {
  if (requireClaimIndexerRewards) return claimIndexerRewardsModalText;

  return {
    title: t('indexer.updateCommissionRate'),
    steps: [t('indexer.setNewCommissionRate'), t('indexer.confirmOnMetamask')],
    description: t('indexer.newRateValidNext2Era'),
    inputTitle: t('indexer.enterCommissionRate'),
    inputBottomText: `${t('indexer.currentRate')}: ${commissionRate ?? 0}%`,
    submitText: t('indexer.confirmRate'),
    failureText: `Sorry, the commission update operation has failed.`,
  };
};

export const SetCommissionRate: React.VFC = () => {
  const pendingContracts = useContracts();
  const { t } = useTranslation();
  const { account } = useWeb3();

  const rewardClaimStatus = useRewardCollectStatus(account || '');
  const commissionRate = useCommissionRate(account);

  const handleClick = async (amount: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');
    return contracts.indexerRegistry.setCommissionRate(Math.floor(parseInt(amount, 10) * COMMISSION_DIV_UNIT));
  };

  return renderAsyncArray(mergeAsync(rewardClaimStatus, commissionRate), {
    error: (error) => <Typography>{`Failed to get indexer info: ${error.message}`}</Typography>,
    loading: () => <Spinner />,
    empty: () => <></>,
    data: (data) => {
      const [indexerRewards, sortedCommissionRate] = data;

      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;
      const modalText = getModalText(requireClaimIndexerRewards, sortedCommissionRate?.toString(), t);

      return (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: t('indexer.updateCommissionRate'),
              key: 'commission',
            },
          ]}
          inputParams={{
            min: 0,
            max: 100,
            showMaxButton: false,
            unit: '%',
          }}
          onClick={handleClick}
          onSuccess={() => commissionRate.refetch(true)}
          renderContent={(onSubmit, _, loading) => {
            if (requireClaimIndexerRewards) {
              return <ModalClaimIndexerRewards onSuccess={() => rewardClaimStatus.refetch()} indexer={account ?? ''} />;
            }
          }}
        />
      );
    },
  });
};
