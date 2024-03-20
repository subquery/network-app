// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useConsumerHostServices } from '@hooks/useConsumerHostServices';
import { StateChannelFieldsFragment as ConsumerFlexPlan } from '@subql/network-query';
import { Button } from 'antd';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { AppTypography, SummaryList } from '../../../components';
import TransactionModal from '../../../components/TransactionModal';
import { parseError, TOKEN } from '../../../utils';
import { ROUTES } from '../../../utils';
import { formatEther } from '../../../utils/numberFormatters';
import styles from './MyFlexPlans.module.css';

const { PLAYGROUND_NAV } = ROUTES;

interface IOngoingFlexPlanActions {
  flexPlan: ConsumerFlexPlan;
  onSuccess: () => void;
}

const useTerminatePlan = () => {
  const { getUserChannelState } = useConsumerHostServices({ autoLogin: false });
  const { contracts } = useWeb3Store();
  const terminatePlan = async (flexPlanId: string) => {
    const res = await getUserChannelState(flexPlanId);
    console.warn(res.data.channelId);
    if (res.data.channelId) {
      const hash = await contracts?.stateChannel.terminate(res.data);
      const result = await hash?.wait();

      return result?.status;
    }

    return false;
  };
  return {
    terminatePlan,
  };
};

export const OngoingFlexPlanActions: React.FC<IOngoingFlexPlanActions> = ({ flexPlan, onSuccess }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [error, setError] = React.useState<string>();
  const { total, spent } = flexPlan;
  const remainDeposit = formatEther(BigNumber.from(total).sub(BigNumber.from(spent)), 4);
  const navigate = useNavigate();
  const { terminatePlan } = useTerminatePlan();

  const modalText = {
    title: t('myFlexPlans.terminate.terminatePlan'),
    steps: [],
    description: t('myFlexPlans.terminate.terminateDesc'),
  };

  const handleOnSubmit = async (onCancel: () => void) => {
    setIsLoading(true);
    try {
      const terminateResult = await terminatePlan(flexPlan.id);
      if (terminateResult) {
        onSuccess && onSuccess();
        onCancel();
      }
    } catch (e) {
      setError(`Failed to terminated. ${parseError(e)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.actionList}>
      <Button
        onClick={() => {
          navigate(`${PLAYGROUND_NAV}/${flexPlan.id}`, { state: flexPlan });
        }}
        size="middle"
        type={'link'}
        loading={isLoading}
      >
        {t('myFlexPlans.playground')}
      </Button>
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
            <div className="flex-end">
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
    </div>
  );
};
