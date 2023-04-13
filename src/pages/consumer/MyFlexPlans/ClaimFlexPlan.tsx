// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography, Button } from 'antd';
import assert from 'assert';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { StateChannelFieldsFragment as ConsumerFlexPlan } from '@subql/network-query';
import TransactionModal from '../../../components/TransactionModal';
import styles from './MyFlexPlans.module.css';
import { formatEther } from '../../../utils/numberFormatters';
import { TOKEN } from '../../../utils';
import { ChannelStatus } from '@subql/network-query';
import { useWeb3Store } from 'src/stores';

interface ClaimFlexPlanProps {
  flexPlan: ConsumerFlexPlan;
  onSuccess: () => void;
}

export const ClaimFlexPlan: React.FC<ClaimFlexPlanProps> = ({ flexPlan, onSuccess }) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();

  const { status, expiredAt, id, total, spent } = flexPlan;
  const planUnFinalised = status !== ChannelStatus.FINALIZED && new Date(expiredAt).getTime() < Date.now();
  const hasClaimed = !planUnFinalised;
  const actionTxt = hasClaimed ? t('myFlexPlans.claim.claimed') : t('myFlexPlans.claim.button');

  const remainDeposit = formatEther(BigNumber.from(total).sub(BigNumber.from(spent)), 4);

  const claimText = {
    title: t('myFlexPlans.claim.title'),
    steps: [t('general.confirm'), t('general.confirmOnMetamask')],
    description: t('myFlexPlans.claim.description', { remainDeposit, token: TOKEN }),
    submitText: t('myFlexPlans.claim.submit'),
    failureText: t('myFlexPlans.claim.failureText'),
  };

  const handleClick = async () => {
    assert(contracts, 'Contracts not available');

    return contracts.stateChannel.claim(id);
  };

  return (
    <TransactionModal
      variant="textBtn"
      text={claimText}
      actions={[{ label: actionTxt, key: 'claim', disabled: hasClaimed }]}
      onClick={handleClick}
      onSuccess={onSuccess}
      renderContent={(onSubmit, _, isLoading, error) => (
        <>
          <Typography className={'errorText'}>{error}</Typography>
          <div className={styles.btnContainer}>
            <Button
              onClick={onSubmit}
              htmlType="submit"
              shape="round"
              size="large"
              type={'primary'}
              loading={isLoading}
            >
              {claimText.submitText}
            </Button>
          </div>
        </>
      )}
    />
  );
};
