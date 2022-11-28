// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { parseEther } from '@ethersproject/units';
import { Web3Provider } from '@ethersproject/providers';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@subql/react-ui';
import moment from 'moment';
import { BigNumber, BigNumberish, ethers } from 'ethers';
import { Button, Space, Typography } from 'antd';
import { Form, Formik } from 'formik';
import clsx from 'clsx';
import { NumberInput } from '../../../components';
import { useConsumerOpenFlexPlans, useWeb3 } from '../../../containers';
import { IIndexerFlexPlan } from '../../../hooks';
import { formatEther, getCapitalizedStr, POST, renderAsync, TOKEN } from '../../../utils';
import TransactionModal from '../../../components/TransactionModal';

import { ConsumerHostMessageType, getEip721Signature, withChainIdRequestBody } from '../../../utils/eip712';

async function requestConsumerHostToken(
  account: string,
  library: Web3Provider | undefined,
): Promise<{ data?: string; error?: string }> {
  try {
    const tokenRequestUrl = `${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/login`;
    const timestamp = new Date().getTime();

    const signMsg = {
      consumer: account,
      timestamp,
    };
    const eip721Signature = await getEip721Signature(signMsg, ConsumerHostMessageType, account, library);

    if (!eip721Signature) throw new Error();

    const { response, error } = await POST({
      endpoint: tokenRequestUrl,
      requestBody: withChainIdRequestBody(signMsg, eip721Signature),
    });

    if (error || !response?.ok) {
      throw new Error();
    }

    const sortedResponse = response && (await response.json());
    return { data: sortedResponse };
  } catch (error) {
    console.error('Failed to request token of consumer host.');
    return { error: 'Failed to request token of consumer host.' };
  }
}

async function purchasePlan(amount: BigNumberish, period: number, deploymentIndexer: number, authToken: string) {
  try {
    const purchaseUrl = `${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/users/projects`;

    const { response, error } = await POST({
      endpoint: purchaseUrl,
      headers: { Authorization: `Bearer ${authToken}` },
      requestBody: {
        deployment_indexer: deploymentIndexer,
        amount,
        expiration: period,
      },
    });

    if (error || !response?.ok) {
      throw new Error();
    }

    const sortedResponse = response && (await response.json());

    return { data: sortedResponse };
  } catch (error) {
    console.error(`Failed to purchase flex plan. ${error}`);
    return { error: `Failed to purchase flex plan. ${error}` };
  }
}

interface IPurchaseForm {
  currentStep: number;
  onStep: (step: number) => void;
  onClose: () => void;
  balance: BigNumber | undefined;
  deploymentIndexer: number;
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

const PurchaseForm: React.VFC<IPurchaseForm> = ({ currentStep, onStep, onClose, balance, deploymentIndexer }) => {
  const [isloading, setIsLoading] = React.useState<boolean>();
  const [error, setError] = React.useState<string>();
  const { t } = useTranslation();
  const sortedBalance = formatEther(balance ?? '0');
  const { account, library } = useWeb3();
  const maxDepositAmount = `Billing Balance: ${formatEther(balance ?? '0', 4)} ${TOKEN}`;

  const onSubmit = async (submitData: { period: number; amount: string }) => {
    const { period, amount } = submitData;
    const sortedPeriod = period * 24 * 60 * 60; //NOTE: days -> seconds
    const sortedAmount = parseEther(amount);

    setIsLoading(true);
    const authToken = await requestConsumerHostToken(account ?? '', library);
    // TODO: throw Error
    const purchaseRequest = await purchasePlan(sortedAmount, sortedPeriod, deploymentIndexer, authToken?.data ?? '');
    setIsLoading(false);
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
            unit={getCapitalizedStr(values[PERIOD_FORM_FIELD] > 0 ? t('general.days') : t('general.day'))}
            inputParams={{
              name: PERIOD_FORM_FIELD,
              id: PERIOD_FORM_FIELD,
              onChange: (value) => {
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

          <Space className={clsx('flex', 'flex-end')}>
            <Button onClick={() => onClose()} type="ghost" shape="round" size="large">
              {t('general.cancel')}
            </Button>
            <Button
              onClick={submitForm}
              loading={isSubmitting}
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
}

// TODO: Improve renderAsync render cache when reloading
export const PurchaseFlexPlan: React.VFC<PurchaseFlexPlaneProps> = ({ flexPlan, balance }) => {
  const [curStep, setCurStep] = React.useState<number>(0);
  const [now, setNow] = React.useState<Date>(moment().toDate());
  const { t } = useTranslation();
  const { account } = useWeb3();

  const isIndexerOffline = !!(BigNumber.from(flexPlan.price).isZero() || BigNumber.from(flexPlan.max_time).isZero());

  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     setNow(moment().toDate());
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const flexPlans = useConsumerOpenFlexPlans({ consumer: account ?? '', now });
  const refetchFlexPlans = setTimeout(() => flexPlans.refetch({ consumer: account ?? '', now }), 10000);

  const modalText = {
    title: t('flexPlans.purchaseModal'),
    steps: [t('flexPlans.purchase'), t('flexPlans.confirmPurchase')],
  };

  return renderAsync(flexPlans, {
    error: (error) => <Typography>{`Error: ${error}`}</Typography>,
    loading: () => <Spinner />,
    data: (data) => {
      return (
        <TransactionModal
          text={modalText}
          actions={[
            {
              label: t('flexPlans.purchase'),
              key: 'purchaseFlexPlan',
              disabled: isIndexerOffline,
              tooltip: isIndexerOffline ? t('flexPlans.disabledPurchase') : '',
            },
          ]}
          renderContent={(onSubmit, onCancel, isLoading, error) => {
            return (
              <PurchaseForm
                balance={balance}
                currentStep={curStep}
                onStep={setCurStep}
                onClose={onCancel}
                deploymentIndexer={flexPlan.id}
              />
            );
          }}
          variant={isIndexerOffline ? 'disabledTextBtn' : 'textBtn'}
          currentStep={curStep}
        />
      );
    },
  });
};
