// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { parseEther } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
import { useContracts } from '../../../../containers';
import TransactionModal from '../../../../components/TransactionModal';
import { useRewardCollectStatus } from '../../../../hooks/useRewardCollectStatus';
import { convertStringToNumber, renderAsync } from '../../../../utils';
import { Spinner, Typography } from '@subql/react-ui';
import { useLockPeriod } from '../../../../hooks';
import moment from 'moment';

interface DoUndelegateProps {
  indexerAddress: string;
  availableBalance?: string;
}

export const DoUndelegate: React.VFC<DoUndelegateProps> = ({ indexerAddress, availableBalance }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();
  const rewardClaimStatus = useRewardCollectStatus(indexerAddress);
  const lockPeriod = useLockPeriod();

  const modalText = {
    title: t('delegate.undelegate'),
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
    description: t('delegate.undelegateValidNextEra', {
      duration: `${moment.duration(lockPeriod.data, 'seconds').as('hours').toPrecision(3)} hours`,
    }),
    inputTitle: t('delegate.undelegateAmount'),
    submitText: t('delegate.confirmUndelegate'),
    failureText: 'Sorry, could not undelegate',
  };

  const handleClick = async (amount: string) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const delegateAmount = parseEther(amount.toString());
    const pendingTx = contracts.staking.undelegate(indexerAddress, delegateAmount);

    return pendingTx;
  };

  return renderAsync(rewardClaimStatus, {
    error: (error) => <Typography>{`Error: ${error}`}</Typography>,
    loading: () => <Spinner />,
    data: (data) => {
      const { hasClaimedRewards } = data;
      const hasBalanceForNextEra = parseEther(availableBalance ?? '0').gt('0');
      const disabled = !hasClaimedRewards || !hasBalanceForNextEra;
      const tooltip =
        (!hasClaimedRewards && t('delegate.invalidUndelegateBeforeRewardCollect')) ||
        (!hasBalanceForNextEra && t('delegate.nonToUndelegate')) ||
        '';
      return (
        <TransactionModal
          variant="textBtn"
          text={modalText}
          actions={[
            {
              label: t('delegate.undelegate'),
              key: 'undelegate',
              disabled,
              tooltip,
            },
          ]}
          inputParams={{
            showMaxButton: true,
            stringMode: true,
            curAmount: availableBalance,
            max: convertStringToNumber(availableBalance ?? '0'),
          }}
          onClick={handleClick}
          initialCheck={rewardClaimStatus}
        />
      );
    },
  });
};
