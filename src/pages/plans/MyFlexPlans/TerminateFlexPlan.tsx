// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { GetOngoingFlexPlan_stateChannels_nodes as ConsumerFlexPlan } from '../../../__generated__/registry/GetOngoingFlexPlan';
import TransactionModal from '../../../components/TransactionModal';
import styles from './MyFlexPlans.module.css';
import { formatEther } from '../../../utils/numberFormatters';
import { TOKEN } from '../../../utils';
import { AppTypography, SummaryList } from '../../../components';

async function terminatePlan(channelId: string) {
  try {
    const terminateUrl = `${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/${channelId}/terminate`;

    const response = await fetch(terminateUrl);

    const sortedResponse = response && (await response.json());

    if (!response?.ok || sortedResponse?.error) {
      throw new Error(sortedResponse?.error);
    }

    return { data: sortedResponse };
  } catch (error) {
    console.error(`Failed to terminate flex plan. ${error}`);
    return { error };
  }
}

interface TerminateFlexPlanProps {
  flexPlan: ConsumerFlexPlan;
  onSuccess: () => void;
}

export const TerminateFlexPlan: React.VFC<TerminateFlexPlanProps> = ({ flexPlan }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [error, setError] = React.useState<boolean>();
  const { total, spent } = flexPlan;
  const remainDeposit = formatEther(BigNumber.from(total).sub(BigNumber.from(spent)), 4);

  const modalText = {
    title: t('myFlexPlans.terminate.terminatePlan'),
    steps: [],
    description: t('myFlexPlans.terminate.terminateDesc'),
  };

  const handleOnSubmit = async () => {
    setIsLoading(true);
    const terminateResult = await terminatePlan(flexPlan.id);
    setIsLoading(false);
  };

  return (
    <TransactionModal
      variant="errTextBtn"
      text={modalText}
      actions={[
        {
          label: t('myFlexPlans.terminate.title'),
          key: 'terminate',
        },
      ]}
      renderContent={() => (
        <>
          <SummaryList
            list={[{ label: t('myFlexPlans.terminate.remainDeposit'), value: `${remainDeposit} ${TOKEN}` }]}
          />
          {error && (
            <AppTypography type="danger" className={styles.terminateError}>
              {error}
            </AppTypography>
          )}
          <div className={styles.btnContainer}>
            <Button
              onClick={handleOnSubmit}
              htmlType="submit"
              shape="round"
              size="large"
              type={'primary'}
              danger
              loading={isLoading}
            >
              {t('myFlexPlans.terminate.title')}
            </Button>
          </div>
        </>
      )}
    />
  );
};
