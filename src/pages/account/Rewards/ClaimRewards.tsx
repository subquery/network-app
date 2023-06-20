// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@subql/components';
import { Button } from 'antd';
import assert from 'assert';

import { useWeb3Store } from 'src/stores';

import TransactionModal from '../../../components/TransactionModal';
import { TOKEN } from '../../../utils';
import styles from './ClaimRewards.module.css';

type Props = {
  account: string;
  indexers: Array<string>;
  totalUnclaimed: string;
  onClaimed?: () => void;
};

export const ClaimRewards: React.FC<Props> = ({ account, indexers, totalUnclaimed, onClaimed }) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();

  const text = {
    title: t('rewards.claim.title'),
    steps: [t('rewards.claim.step1'), t('indexer.confirmOnMetamask')],
    description: t('rewards.claim.description', {
      count: indexers.length,
      totalUnclaimed: totalUnclaimed,
      token: TOKEN,
    }),
    submitText: t('rewards.claim.submit'),
    failureText: 'Sorry, failed to claim rewards',
  };

  const handleClick = async () => {
    assert(contracts, 'Contracts not available');

    const pendingTx = contracts.rewardsHelper.batchClaim(account, indexers);
    pendingTx.then((tx) => tx.wait()).then(() => onClaimed?.());
    return pendingTx;
  };

  return (
    <TransactionModal
      variant="button"
      text={text}
      actions={[{ label: t('rewards.claim.button'), key: 'claim' }]}
      onClick={handleClick}
      rethrowWhenSubmit
      renderContent={(onSubmit, _, isLoading, error) => {
        return (
          <div>
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
          </div>
        );
      }}
    />
  );
};
