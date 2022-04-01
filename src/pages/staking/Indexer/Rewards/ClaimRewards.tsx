// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TransactionModal from '../../../../components/TransactionModal';
import { useContracts } from '../../../../containers';
import styles from './ClaimRewards.module.css';
import { Typography } from '@subql/react-ui';

type Props = {
  indexer: string;
  amount: string;
  onClaimed?: () => void;
};

const ClaimRewards: React.FC<Props> = ({ indexer, onClaimed, amount }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const text = {
    title: t('rewards.claim.title'),
    steps: [t('rewards.claim.step1'), t('indexer.confirmOnMetamask')],
    description: t('rewards.claim.desription', { amount }),
    inputTitle: '',
    submitText: t('rewards.claim.submit'),
    failureText: 'Sorry, failed to claim rewards',
  };

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const pendingTx = contracts.rewardsDistributor.claim(indexer);

    pendingTx.then((tx) => tx.wait()).then(() => onClaimed?.());

    return pendingTx;
  };

  return (
    <TransactionModal
      variant="textBtn"
      text={text}
      actions={[{ label: t('rewards.claim.button'), key: 'claim' }]}
      onClick={handleClick}
      renderContent={(onSubmit, _, isLoading, error) => {
        return (
          <>
            <Typography className={'errorText'}>{error}</Typography>
            <div className={styles.btnContainer}>
              <Button
                onClick={onSubmit}
                htmlType="submit"
                shape="round"
                size="large"
                className={styles.submitBtn}
                loading={isLoading}
              >
                {text.submitText}
              </Button>
            </div>
          </>
        );
      }}
    />
  );
};

export default ClaimRewards;
