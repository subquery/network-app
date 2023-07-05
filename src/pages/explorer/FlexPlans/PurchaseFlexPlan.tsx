// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationType, openNotification } from '@components/Notification';
import { parseEther } from '@ethersproject/units';
import { Spinner } from '@subql/components';
import { Button, Space, Typography } from 'antd';
import clsx from 'clsx';
import { BigNumber, ethers } from 'ethers';
import { Form, Formik } from 'formik';
import moment from 'moment';
import * as yup from 'yup';

import { NumberInput } from '../../../components';
import { BillingExchangeModal } from '../../../components/BillingTransferModal';
import TransactionModal from '../../../components/TransactionModal';
import { useConsumerOpenFlexPlans, useWeb3 } from '../../../containers';
import { IIndexerFlexPlan } from '../../../hooks';
import { formatEther, getAuthReqHeader, getCapitalizedStr, parseError, POST, renderAsync, TOKEN } from '../../../utils';
import { requestConsumerHostToken } from '../../../utils/eip721SignTokenReq';

async function purchasePlan(amount: string, period: number, deploymentIndexer: number, authToken: string) {
  try {
    const purchaseUrl = `${import.meta.env.VITE_CONSUMER_HOST_ENDPOINT}/users/projects`;

    const { response, error } = await POST({
      endpoint: purchaseUrl,
      headers: { ...getAuthReqHeader(authToken) },
      requestBody: {
        deployment_indexer: deploymentIndexer,
        amount,
        expiration: period,
        signature: '',
      },
    });

    const sortedResponse = response && (await response.json());

    if (error || !response?.ok || sortedResponse?.error) {
      throw new Error(sortedResponse?.error ?? error);
    }

    return { data: sortedResponse };
  } catch (error) {
    parseError(error);
    return { error: `${error ?? 'Failed to purchase flex plan.'}` };
  }
}

interface IPurchaseForm {
  currentStep: number;
  onStep: (step: number) => void;
  onClose: () => void;
  balance: BigNumber | undefined;
  deploymentIndexer: number;
  onSuccess: () => void;
}

const PERIOD_FORM_FIELD = 'period';
const AMOUNT_FORM_FIELD = 'amount';
const purchaseFlexPlanSchema = yup.object({
  [PERIOD_FORM_FIELD]: yup.number().defined('Period should be greater than 0.').moreThan(0),
  [AMOUNT_FORM_FIELD]: yup
    .string()
    .required('Deposit should be greater than 0.')
    .test('Deposit should be greater than 0.', (amount) =>
      amount ? ethers.utils.parseUnits(amount, 18).gt('0') : false,
    ),
});

const PurchaseForm: React.FC<IPurchaseForm> = ({ onClose, balance, deploymentIndexer, onSuccess }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>();
  const [error, setError] = React.useState<string>();
  const { t } = useTranslation();
  const sortedBalance = formatEther(balance ?? '0');
  const { account, library } = useWeb3();
  const maxDepositAmount = `Billing Balance: ${formatEther(balance ?? '0', 4)} ${TOKEN}`;

  const onSubmit = async (submitData: { period: number; amount: string }) => {
    try {
      const { period, amount } = submitData;
      const sortedPeriod = period * 24 * 60 * 60; //NOTE: days -> seconds
      const sortedAmount = parseEther(amount);

      setIsLoading(true);
      const authToken = await requestConsumerHostToken(account ?? '', library);

      const purchaseRequest = await purchasePlan(
        sortedAmount.toString(),
        sortedPeriod,
        deploymentIndexer,
        authToken?.data ?? '',
      );

      const { data, error } = purchaseRequest;
      if (error) throw Error(error);
      if (data?.id) {
        openNotification({
          type: NotificationType.SUCCESS,
          title: t('flexPlans.successPurchaseTitle'),
          description: t('flexPlans.successPurchaseDesc'),
        });
        onSuccess();
        onClose();
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      const errMsg = `Failed to purchase the plan: ${error}`;
      setIsLoading(false);
      setError(errMsg);
    }
  };

  return (
    <Formik
      initialValues={{
        period: 0,
        amount: '0',
      }}
      validationSchema={purchaseFlexPlanSchema}
      onSubmit={onSubmit}
      validateOnChange
    >
      {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, errors, resetForm }) => (
        <Form>
          <NumberInput
            title={t('flexPlans.expectQueryPeriod')}
            tooltip={t('flexPlans.expectQueryPeriodTooltip')}
            unit={getCapitalizedStr(values[PERIOD_FORM_FIELD] > 1 ? t('general.days') : t('general.day'))}
            inputParams={{
              name: PERIOD_FORM_FIELD,
              id: PERIOD_FORM_FIELD,
              onChange: (value) => {
                setError(undefined);
                setErrors({ [PERIOD_FORM_FIELD]: undefined });
                setFieldValue(PERIOD_FORM_FIELD, value);
              },
              value: values[PERIOD_FORM_FIELD],
              disabled: isSubmitting,
              min: 0,
            }}
          />
          {errors[PERIOD_FORM_FIELD] && (
            <Typography.Text type="danger">{t('flexPlans.invalidQueryPeriod')}</Typography.Text>
          )}

          <NumberInput
            title={t('flexPlans.depositAmount')}
            tooltip={t('flexPlans.depositAmountTooltip')}
            inputParams={{
              name: AMOUNT_FORM_FIELD,
              id: AMOUNT_FORM_FIELD,
              onChange: (value) => {
                setError(undefined);
                setErrors({ [AMOUNT_FORM_FIELD]: undefined });
                setFieldValue(AMOUNT_FORM_FIELD, value);
              },
              value: values[AMOUNT_FORM_FIELD],
              disabled: isSubmitting,
              stringMode: true,
              min: 0,
            }}
            maxAmount={sortedBalance ?? undefined}
            maxAmountText={maxDepositAmount}
            onClickMax={(value) => {
              setErrors({ [AMOUNT_FORM_FIELD]: undefined });
              setFieldValue(AMOUNT_FORM_FIELD, value);
            }}
          />
          {errors[AMOUNT_FORM_FIELD] && (
            <Typography.Text type="danger">{t('flexPlans.invalidDepositAmount')}</Typography.Text>
          )}

          {error && <Typography.Text type="danger">{error}</Typography.Text>}

          <Space className={clsx('flex', 'flex-end')}>
            <Button onClick={() => onClose()} type="ghost" shape="round" size="large">
              {t('general.cancel')}
            </Button>
            <Button
              onClick={submitForm}
              loading={isSubmitting || isLoading}
              disabled={
                !isValid ||
                isSubmitting ||
                values[PERIOD_FORM_FIELD] <= 0 ||
                !parseEther(values[AMOUNT_FORM_FIELD]).isZero
              }
              className={!isValid || isSubmitting ? 'disabledButton' : 'button'}
              type="primary"
              shape="round"
              size="large"
            >
              {t('flexPlans.purchase')}
            </Button>
          </Space>
        </Form>
      )}
    </Formik>
  );
};

interface PurchaseFlexPlaneProps {
  flexPlan: IIndexerFlexPlan;
  balance: BigNumber | undefined;
  isPurchased: boolean;
  onFetchBalance: () => void;
}

// TODO: Improve renderAsync render cache when reloading
// TODO: Current need to wait dynamic time for purchase result on chain.
export const PurchaseFlexPlan: React.FC<PurchaseFlexPlaneProps> = ({
  flexPlan,
  balance,
  isPurchased,
  onFetchBalance,
}) => {
  const [curStep, setCurStep] = React.useState<number>(0);
  const [now] = React.useState<Date>(moment().toDate());
  const { t } = useTranslation();
  const { account } = useWeb3();

  const isIndexerOffline = !flexPlan.online;
  const isZeroBalance = balance?.eq(BigNumber.from(0));

  const isDisabled = !account || isPurchased || isIndexerOffline;
  const disabledTooltip = isIndexerOffline
    ? t('flexPlans.disabledPurchaseAsOffline')
    : !account
    ? t('general.connectAccount')
    : '';

  const flexPlans = useConsumerOpenFlexPlans({ consumer: account ?? '', now });
  const refetchOnSuccess = () => {
    flexPlans.refetch({ consumer: account ?? '', now });
    onFetchBalance();
  };

  const modalText = {
    title: t('flexPlans.purchaseModal'),
    steps: [t('flexPlans.purchase'), t('flexPlans.confirmPurchase')],
  };

  return renderAsync(flexPlans, {
    error: (error) => <Typography>{`Error: ${error}`}</Typography>,
    loading: () => <Spinner />,
    data: (data) =>
      isZeroBalance ? (
        <BillingExchangeModal action="Transfer" />
      ) : (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: isPurchased ? t('flexPlans.purchased') : t('flexPlans.purchase'),
              key: 'purchaseFlexPlan',
              disabled: isDisabled,
              tooltip: disabledTooltip,
            },
          ]}
          renderContent={(onSubmit, onCancel, isLoading, error) => {
            return (
              <PurchaseForm
                balance={balance}
                currentStep={curStep}
                onStep={setCurStep}
                onClose={onCancel}
                onSuccess={refetchOnSuccess}
                deploymentIndexer={flexPlan.id}
              />
            );
          }}
          variant={isIndexerOffline ? 'disabledTextBtn' : 'textBtn'}
          currentStep={curStep}
        />
      ),
  });
};
