// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { BigNumber } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { StateChannelFieldsFragment as ConsumerFlexPlan } from '@subql/network-query';
import TransactionModal from '../../../components/TransactionModal';
import styles from './MyFlexPlans.module.css';
import { formatEther } from '../../../utils/numberFormatters';
import { getAuthReqHeader, TOKEN } from '../../../utils';
import { AppTypography, SummaryList } from '../../../components';
import { requestConsumerHostToken } from '../../../utils/eip721SignTokenReq';
import { useWeb3 } from '../../../containers';

async function terminatePlan(flexPlanId: string, account: string, library: Web3Provider | undefined) {
  try {
    const { error, data: consumerToken } = await requestConsumerHostToken(account, library);

    if (error || !consumerToken) {
      throw new Error('Failed to request user authentication.');
    }

    const terminateUrl = `${import.meta.env.VITE_CONSUMER_HOST_ENDPOINT}/users/channels/${flexPlanId}/terminate`;

    const response = await fetch(terminateUrl, {
      headers: { ...getAuthReqHeader(consumerToken) },
    });

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

export const TerminateFlexPlan: React.FC<TerminateFlexPlanProps> = ({ flexPlan }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [error, setError] = React.useState<string>();
  const { account, library } = useWeb3();
  const { total, spent } = flexPlan;
  const remainDeposit = formatEther(BigNumber.from(total).sub(BigNumber.from(spent)), 4);

  const modalText = {
    title: t('myFlexPlans.terminate.terminatePlan'),
    steps: [],
    description: t('myFlexPlans.terminate.terminateDesc'),
  };

  const handleOnSubmit = async (onCancel: () => void) => {
    setIsLoading(true);
    const terminateResult = await terminatePlan(flexPlan.id, account ?? '', library);
    const { error, data } = terminateResult;

    if (error) {
      setError(`Failed to terminated. ${error}`);
    }

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
      renderContent={(onSubmit, onCancel) => (
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
              onClick={() => handleOnSubmit(onCancel)}
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
