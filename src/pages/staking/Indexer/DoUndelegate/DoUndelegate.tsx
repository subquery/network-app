// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import { parseEther } from 'ethers/lib/utils';
import { useTranslation } from 'react-i18next';
import { useContracts } from '../../../../containers';
import TransactionModal from '../../../../components/TransactionModal';

interface DoUndelegateProps {
  indexerAddress: string;
}

export const DoUndelegate: React.VFC<DoUndelegateProps> = ({ indexerAddress }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const modalText = {
    title: t('delegate.undelegate'),
    steps: [t('delegate.enterAmount'), t('indexer.confirmOnMetamask')],
    description: t('delegate.undelegateValidNextEra'),
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

  return (
    <TransactionModal
      variant="textBtn"
      text={modalText}
      actions={[{ label: t('delegate.undelegate'), key: 'undelegate' }]}
      inputParams={{
        showMaxButton: true,
      }}
      onClick={handleClick}
    />
  );
};
