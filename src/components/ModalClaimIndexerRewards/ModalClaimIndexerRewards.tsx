// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import assert from 'assert';
import i18next from '../../i18n';
import { Button, Typography } from 'antd';
import styles from './ModalClaimIndexerRewards.module.css';
import { parseError } from '../../utils';
import { useWeb3Store } from 'src/stores';

export const claimIndexerRewardsModalText = {
  title: i18next.t('claimIndexerRewards.title'),
  description: i18next.t('claimIndexerRewards.confirmToProceed'),
  submitText: i18next.t('claimIndexerRewards.confirm'),
  steps: [i18next.t('general.confirm'), i18next.t('general.confirmOnMetamask')],
  failureText: i18next.t('claimIndexerRewards.failureCollect'),
};

interface IModalClaimIndexerRewards {
  indexer: string;
  isLoading?: boolean;
  submitText?: string;
  onSuccess?: () => void;
  onFail?: () => void;
}

export const ModalClaimIndexerRewards: React.FC<IModalClaimIndexerRewards> = ({
  indexer,
  submitText,
  onFail,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>();
  const { contracts } = useWeb3Store();

  const onClaimIndexerRewards = async () => {
    try {
      setIsLoading(true);
      assert(contracts, 'Contracts not available');

      const approvalTx = await contracts.rewardsHelper.indexerCatchup(indexer);
      const approvalTxResult = await approvalTx.wait();

      if (approvalTxResult.status === 1) {
        onSuccess && onSuccess();
      } else {
        onFail && onFail();
      }
    } catch (error) {
      console.error('onClaimIndexerRewards', error);
      setError(parseError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {error && (
        <Typography.Paragraph type="danger" className={styles.error}>
          {error}
        </Typography.Paragraph>
      )}
      <div className={styles.btnContainer}>
        <Button
          shape="round"
          size="large"
          className={isLoading ? 'disabledButton' : 'button'}
          loading={isLoading}
          disabled={isLoading}
          onClick={onClaimIndexerRewards}
        >
          {submitText || 'Confirm'}
        </Button>
      </div>
    </>
  );
};
