// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { openNotification, Typography } from '@subql/components';
import { Button } from 'antd';
import assert from 'assert';

import { useWeb3Store } from 'src/stores';

import TransactionModal from '../../../components/TransactionModal';
import { TOKEN } from '../../../utils';
import styles from './ClaimRewards.module.less';

type Props = {
  account: string;
  indexers: Array<string>;
  totalUnclaimed: string;
  unCliamedCountByIndexer: number;
  onClaimed?: () => void;
};

export const ClaimRewards: React.FC<Props> = ({
  account,
  indexers,
  totalUnclaimed,
  unCliamedCountByIndexer,
  onClaimed,
}) => {
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
    if (unCliamedCountByIndexer > 100) {
      openNotification({
        type: 'info',
        description: 'unclaimed rewards are more than 100, need to claim more than once.',
        duration: 5,
      });
    }

    const pendingTx = contracts.rewardsHelper.batchClaim(account, indexers);
    pendingTx.then((tx) => tx.wait()).then(() => onClaimed?.());
    return pendingTx;
  };

  return (
    <TransactionModal
      variant="button"
      text={text}
      buttonClassName={styles.claimButton}
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
