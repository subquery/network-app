// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3 } from '../../../../containers';
import TransactionModal from '../../../../components/TransactionModal';
import { useIsIndexer } from '../../../../hooks';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { mergeAsync, renderAsyncArray } from '../../../../utils';
import { Spinner, Typography } from '@subql/react-ui';
import { COMMISSION_DIV_UNIT, useCommissionRate } from '../../../../hooks/useCommissionRate';

export const SetCommissionRate: React.VFC = () => {
  const pendingContracts = useContracts();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const isIndexer = useIsIndexer(account);
  const rewardClaimStatus = useRewardCollectStatus(account || '');
  const commissionRate = useCommissionRate(account);

  const modalText = React.useMemo(
    () => ({
      title: t('indexer.updateCommissionRate'),
      steps: [t('indexer.setNewCommissionRate'), t('indexer.confirmOnMetamask')],
      description: t('indexer.newRateValidNext2Era'),
      inputTitle: t('indexer.enterCommissionRate'),
      inputBottomText: `${t('indexer.currentRate')}: ${commissionRate.data}%`,
      submitText: t('indexer.confirmRate'),
      failureText: `Sorry, the commission update operation has failed.`,
    }),
    [commissionRate.data, t],
  );

  const handleClick = async (amount: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');
    return contracts.staking.setCommissionRate(Math.floor(parseInt(amount, 10) * COMMISSION_DIV_UNIT));
  };

  return renderAsyncArray(mergeAsync(isIndexer, rewardClaimStatus), {
    error: (error) => <Typography>{`Failed to get indexer info: ${error.message}`}</Typography>,
    loading: () => <Spinner />,
    empty: () => <></>,
    data: (data) => {
      const [isIndexer, rewardClaimStatus] = data;
      if (!isIndexer) return null;
      return (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: t('indexer.updateCommissionRate'),
              key: 'commission',
              disabled: !rewardClaimStatus?.hasClaimedRewards,
              tooltip: !rewardClaimStatus?.hasClaimedRewards
                ? t('indexer.disabledSetCommissionBeforeRewardClaim')
                : undefined,
            },
          ]}
          inputParams={{
            max: 100,
            min: 0,
            unit: '%',
          }}
          onClick={handleClick}
        />
      );
    },
  });
};
