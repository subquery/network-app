// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { OutlineDot } from '@components/Icons/Icons';
import { TransactionModalRef } from '@components/TransactionModal/TransactionModal';
import { useMinCommissionRate } from '@hooks/useMinCommissionRate';
import { Spinner, Typography } from '@subql/components';
import { Button, Dropdown } from 'antd';
import assert from 'assert';
import { TFunction } from 'i18next';

import { useWeb3Store } from 'src/stores';

import { claimIndexerRewardsModalText, ModalClaimIndexerRewards } from '../../../../components';
import TransactionModal from '../../../../components/TransactionModal';
import { useWeb3 } from '../../../../containers';
import { COMMISSION_DIV_UNIT, useCommissionRate } from '../../../../hooks/useCommissionRate';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { mergeAsync, renderAsyncArray } from '../../../../utils';

const getModalText = (requireClaimIndexerRewards = false, commissionRate: string | undefined, t: TFunction) => {
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

export const SetCommissionRate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { contracts } = useWeb3Store();
  const { t } = useTranslation();
  const { account } = useWeb3();
  const modalRef = React.useRef<TransactionModalRef>(null);
  const { minCommission } = useMinCommissionRate();

  const rewardClaimStatus = useRewardCollectStatus(account || '');
  const commissionRate = useCommissionRate(account);

  const handleClick = async (amount: string) => {
    assert(contracts, 'Contracts not available');
    return contracts.indexerRegistry.setCommissionRate(Math.floor(parseInt(amount, 10) * COMMISSION_DIV_UNIT));
  };

  return renderAsyncArray(mergeAsync(rewardClaimStatus, commissionRate), {
    error: (error) => (
      <Typography>
        {t('errors.failedToGetIndexerInfo', {
          message: error.message,
        })}
      </Typography>
    ),
    loading: () => <Spinner />,
    empty: () => <></>,
    data: (data) => {
      const [indexerRewards, sortedCommissionRate] = data;

      const requireClaimIndexerRewards = !indexerRewards?.hasClaimedRewards;
      const modalText = getModalText(requireClaimIndexerRewards, sortedCommissionRate?.after?.toString(), t);

      return (
        <>
          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <Button type="text" style={{ padding: 0, background: 'transparent' }} size="small">
                      Update Commission Rate
                    </Button>
                  ),
                  key: 1,
                  onClick: () => {
                    if (modalRef.current) {
                      modalRef.current.showModal('commission');
                    }
                  },
                },
              ],
            }}
          >
            <OutlineDot></OutlineDot>
          </Dropdown>
          <TransactionModal
            ref={modalRef}
            text={modalText}
            actions={[
              {
                label: t('indexer.updateCommissionRate'),
                key: 'commission',
                style: { display: 'none' },
              },
            ]}
            inputParams={{
              min: minCommission || 0,
              max: 100,
              showMaxButton: false,
              unit: '%',
            }}
            onClick={handleClick}
            onSuccess={() => {
              commissionRate.refetch(true);
              onSuccess();
            }}
            renderContent={(onSubmit, _, loading) => {
              if (requireClaimIndexerRewards) {
                return (
                  <ModalClaimIndexerRewards onSuccess={() => rewardClaimStatus.refetch()} indexer={account ?? ''} />
                );
              }
            }}
          />
        </>
      );
    },
  });
};
