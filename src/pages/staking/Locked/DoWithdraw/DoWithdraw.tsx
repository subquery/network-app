// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { Button } from 'antd';
import * as React from 'react';
import assert from 'assert';
import styles from './DoWithdraw.module.css';
import { useTranslation } from 'react-i18next';
import { useContracts, useWeb3, useWithdrawls } from '../../../../containers';
import TransactionModal from '../../../../components/TransactionModal';
import clsx from 'clsx';

export const DoWithdraw: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const withdrawals = useWithdrawls({ delegator: account || '' });
  const pendingContracts = useContracts();

  console.log('withdrawals', withdrawals);

  const modalText = {
    title: t('withdrawals.withdraw'),
    steps: [t('withdrawals.confirm'), t('indexer.confirmOnMetamask')],
    inputTitle: t('withdrawals.enterWithdrawAmount'),
    submitText: t('withdrawals.confirmWithdraw'),
  };

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    return contracts.staking.widthdraw();
  };

  return (
    <div>
      <TransactionModal
        text={modalText}
        actions={[{ label: t('rewards.claim.button'), key: 'claim' }]}
        onClick={handleClick}
        renderContent={(onSubmit, _, isLoading, error) => {
          return (
            <>
              <Typography className={'errorText'}>{error}</Typography>
              <div className={clsx(styles.btnContainer, 'flex-end')}>
                <Button
                  onClick={onSubmit}
                  htmlType="submit"
                  shape="round"
                  size="large"
                  className={styles.submitBtn}
                  loading={isLoading}
                >
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
