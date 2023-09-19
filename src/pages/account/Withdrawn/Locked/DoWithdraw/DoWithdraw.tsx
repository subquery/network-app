// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/Button';
import TransactionModal from '@components/TransactionModal';
import { Typography } from '@subql/components';
import { truncFormatEtherStr } from '@utils';
import assert from 'assert';
import clsx from 'clsx';

import { useWeb3Store } from 'src/stores';

import styles from './DoWithdraw.module.css';

interface DoWithdrawProps {
  unlockedAmount: string;
  disabled: boolean;
}

export const DoWithdraw: React.FC<DoWithdrawProps> = ({ unlockedAmount, disabled }) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();

  const modalText = {
    title: t('withdrawals.withdraw'),
    steps: [t('withdrawals.confirm'), t('indexer.confirmOnMetamask')],
    inputTitle: t('withdrawals.enterWithdrawAmount'),
    submitText: t('withdrawals.confirmWithdraw'),
  };

  const handleClick = async () => {
    assert(contracts, 'Contracts not available');

    return contracts.stakingManager.widthdraw();
  };

  return (
    <div>
      <TransactionModal
        text={modalText}
        actions={[{ label: t('withdrawals.withdrawAll'), key: 'claim', disabled: disabled }]}
        variant={disabled ? 'disabledButton' : 'button'}
        onClick={handleClick}
        buttonClassName={styles.withdrawButton}
        renderContent={(onSubmit, _, isLoading, error) => {
          return (
            <>
              <Typography className={styles.unlockedAmount}>
                {t('withdrawals.aboutToWithdraw', { amount: truncFormatEtherStr(unlockedAmount) })}
              </Typography>
              <Typography className={'errorText'}>{error}</Typography>
              <div className={clsx(styles.btnContainer, 'flex-end')}>
                <Button onClick={onSubmit} loading={isLoading} size="middle">
                  {modalText.submitText}
                </Button>
              </div>
            </>
          );
        }}
      />
    </div>
  );
};
