// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { openNotification, Typography } from '@subql/components';
import { Button } from 'antd';
import assert from 'assert';
import { ContractReceipt } from 'ethers';

import { useWeb3Store } from 'src/stores';

import TransactionModal from '../../../components/TransactionModal';
import { TOKEN } from '../../../utils';
import styles from './ClaimRewards.module.less';

type Props = {
  account: string;
  indexers: Array<string>;
  unhealthyIndexers?: {
    unregisteredIndexers: {
      id: string;
    }[];
    unclaimedIndexers: {
      id: string;
    }[];
  };
  totalUnclaimed: string;
  unCliamedCountByIndexer: number;
  onClaimed?: (tx?: ContractReceipt) => void;
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
    const pendingTx = await contracts.rewardsHelper.batchClaim(account, indexers);
    const recepit = await pendingTx.wait();
    await onClaimed?.(recepit);
    return pendingTx;
  };

  return (
    <TransactionModal
      variant="button"
      text={text}
      buttonClassName={styles.claimButton}
      actions={[{ label: t('rewards.claim.button'), key: 'claim', style: { width: '100%' } }]}
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

export const ClaimRewardsForStake: React.FC<Props> = ({
  indexers,
  unhealthyIndexers,
  unCliamedCountByIndexer,
  onClaimed,
}) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();

  const unregisterdIndexers = React.useMemo(() => {
    if (unhealthyIndexers?.unregisteredIndexers.length) {
      return `Unregistered: ${unhealthyIndexers?.unregisteredIndexers.map((i) => i.id).join(', ')}`;
    }

    return '';
  }, [unhealthyIndexers?.unregisteredIndexers]);

  const unclaimedIndexers = React.useMemo(() => {
    if (unhealthyIndexers?.unclaimedIndexers.length) {
      return `Unclaimed: ${unhealthyIndexers?.unclaimedIndexers.map((i) => i.id).join(', ')}`;
    }

    return '';
  }, [unhealthyIndexers?.unclaimedIndexers]);

  const text = React.useMemo(() => {
    return {
      title: t('rewards.claim.title'),
      steps: [t('rewards.claim.step1'), t('indexer.confirmOnMetamask')],
      description: `The rewards will directly be staked to the operator. Unregisterd operators and unclaimed reward operators will be skipped. 
      ${unregisterdIndexers} ${unclaimedIndexers}`,
      submitText: t('rewards.claim.submit'),
      failureText: 'Sorry, failed to claim rewards',
    };
  }, [unregisterdIndexers, unclaimedIndexers]);

  const handleClick = async () => {
    assert(contracts, 'Contracts not available');
    if (unCliamedCountByIndexer > 100) {
      openNotification({
        type: 'info',
        description: 'unclaimed rewards are more than 100, need to claim more than once.',
        duration: 5,
      });
    }
    const pendingTx = await contracts.stakingManager.batchStakeReward(indexers);
    const recepit = await pendingTx.wait();
    await onClaimed?.(recepit);
    return pendingTx;
  };

  return (
    <TransactionModal
      variant="button"
      text={text}
      buttonClassName={styles.claimButton}
      actions={[{ label: 'Claim rewards to stake', key: 'claim', style: { width: '100%' } }]}
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
