// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography, Button } from 'antd';
import assert from 'assert';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';

import { GetOngoingFlexPlan_stateChannels_nodes as ConsumerFlexPlan } from '../../../__generated__/registry/GetOngoingFlexPlan';
import TransactionModal from '../../../components/TransactionModal';
import { useContracts } from '../../../containers';
import styles from './MyFlexPlans.module.css';
import { formatEther } from '../../../utils/numberFormatters';
import { TOKEN } from '../../../utils';

interface ClaimFlexPlanProps {
  flexPlan: ConsumerFlexPlan;
}

export const ClaimFlexPlan: React.VFC<ClaimFlexPlanProps> = ({ flexPlan }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const { id, total, spent } = flexPlan;
  const remaindingDeposit = formatEther(BigNumber.from(total).sub(BigNumber.from(spent)), 4);

  const claimText = {
    title: t('myFlexPlans.claim.title'),
    steps: [t('general.confirm'), t('general.confirmOnMetamask')],
    description: t('myFlexPlans.claim.description', { remaindingDeposit, token: TOKEN }),
    submitText: t('myFlexPlans.claim.submit'),
    failureText: t('myFlexPlans.claim.failureText'),
  };

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    return contracts.stateChannel.claim(id);
  };

  return (
    <TransactionModal
      variant="textBtn"
      text={claimText}
      actions={[{ label: 'Claim', key: 'claim' }]}
      onClick={handleClick}
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
