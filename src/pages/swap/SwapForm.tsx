// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Alert, Button } from 'antd';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { getTokenApprovalModalText, ModalApproveToken, NumberInput, Stat, SummaryList } from '../../components';
import styles from './SwapForm.module.css';
import * as Yup from 'yup';
import { tokenDecimals } from '../../utils';
import TransactionModal from '../../components/TransactionModal';

interface Stats {
  title: string;
  value: string;
  tooltip?: string;
}

interface SwapPair {
  from: string;
  fromMax: string;
  to: string;
  toMax: string;
}

interface ISwapForm {
  stats: Array<Stats>;
  pair: SwapPair;
  fromRate?: number;
  noOrderInPool?: boolean;
  requireTokenApproval?: boolean;
  onClickSwap?: () => void;
}

interface PairFrom {
  from: string;
  to: string;
}

const FROM_INPUT_ID = 'from';
const TO_INPUT_ID = 'to';

// TODO: confirm error msg with design/business
// TODO: confirm alert component and move as component
export const SwapForm: React.FC<ISwapForm> = ({
  stats,
  pair,
  fromRate = 1,
  noOrderInPool,
  requireTokenApproval,
  onClickSwap,
}) => {
  const { t } = useTranslation();
  const initialPairValues: PairFrom = { from: '1', to: fromRate.toString() };

  const calWithRate = (fileKey: typeof FROM_INPUT_ID | typeof TO_INPUT_ID, value: string | number) => {
    const val = typeof value === 'number' ? value.toString() : value;
    if (fileKey === FROM_INPUT_ID) {
      return (parseFloat(val) * fromRate).toFixed(tokenDecimals[pair.from] ?? 18);
    }

    if (fileKey === TO_INPUT_ID) {
      return (parseFloat(val) / fromRate).toFixed(tokenDecimals[pair.to] ?? 18);
    }
  };

  const updateFieldVal = (
    fileKey: typeof FROM_INPUT_ID | typeof TO_INPUT_ID,
    value: string | number | null,
    setValues: (props: any) => void,
    setErrors: (props: any) => void,
  ) => {
    if (!value) return null;
    const autoUpdateField = fileKey === FROM_INPUT_ID ? TO_INPUT_ID : FROM_INPUT_ID;
    setErrors({ [fileKey]: undefined });
    const sortedTo = calWithRate(fileKey, value);
    setValues({ [fileKey]: value, [autoUpdateField]: sortedTo });
  };

  const SwapFormSchema = Yup.object().shape({
    from: Yup.string()
      .required()
      .test('isMin', 'From should be greater than 0.', (from) => (from ? parseFloat(from) > 0 : false))
      .test('isMax', 'From should be smaller than max amount.', (from) =>
        from ? parseFloat(from) <= parseFloat(pair.fromMax) : false,
      )
      .typeError('Please input valid from amount.'),
    to: Yup.string()
      .required()
      .test('isMin', 'To should be greater than 0.', (to) => (to ? parseFloat(to) > 0 : false))
      .test('isValid', 'To should be smaller than max amount.', (to) =>
        to ? parseFloat(to) <= parseFloat(pair.toMax) : false,
      )
      .typeError('Please input valid from amount.'),
  });

  const modalText = requireTokenApproval
    ? getTokenApprovalModalText(pair.from)
    : {
        title: t('swap.confirmSwap'),
        steps: [t('swap.reviewSwap'), t('indexer.confirmOnMetamask')],
        submitText: t('general.confirm'),
        failureText: t('swap.swapSuccess'),
        successText: t('swap.swapFailure'),
      };

  return (
    <div className={styles.container}>
      {noOrderInPool && (
        <div className={styles.errorAlert}>
          <Alert message={t('swap.noOrderInPool')} type="error" closable showIcon className={styles.alert} />
        </div>
      )}

      <div className={styles.statsContainer}>
        {stats.map((statsItem) => (
          <div className={styles.stats} key={statsItem.title}>
            <Stat title={statsItem.title} value={statsItem.value} tooltip={statsItem.tooltip} />
          </div>
        ))}
      </div>

      <div>
        <Formik
          initialValues={initialPairValues}
          validationSchema={SwapFormSchema}
          onSubmit={(values, actions) => {
            console.log('values', values);
            // TODO: Form submit action
            actions.setSubmitting(false);
          }}
          validateOnMount
        >
          {({ submitForm, isValid, isSubmitting, setErrors, values, errors, setValues }) => {
            const isActionDisabled = !isValid || noOrderInPool;
            const summaryList = [
              {
                label: t('swap.from'),
                value: `${values[FROM_INPUT_ID]} ${pair.from}`,
              },
              {
                label: t('swap.to'),
                value: `${values[TO_INPUT_ID]} ${pair.to}`,
              },
            ];

            return (
              <Form>
                <NumberInput
                  id={FROM_INPUT_ID}
                  name={FROM_INPUT_ID}
                  title={t('swap.from')}
                  unit={pair.from}
                  stringMode
                  maxAmount={pair.fromMax}
                  value={values.from}
                  onChange={(value) => updateFieldVal(FROM_INPUT_ID, value, setValues, setErrors)}
                  errorMsg={errors[FROM_INPUT_ID]}
                  onClickMax={(value) => updateFieldVal(FROM_INPUT_ID, value.toString(), setValues, setErrors)}
                />
                <NumberInput
                  id={TO_INPUT_ID}
                  name={TO_INPUT_ID}
                  title={t('swap.to')}
                  unit={pair.to}
                  stringMode
                  maxAmount={pair.toMax}
                  value={values.to}
                  onChange={(value) => updateFieldVal(TO_INPUT_ID, value, setValues, setErrors)}
                  errorMsg={errors[TO_INPUT_ID]}
                  onClickMax={(value) => updateFieldVal(TO_INPUT_ID, value.toString(), setValues, setErrors)}
                />

                <div className={styles.swapAction}>
                  <TransactionModal
                    text={modalText}
                    actions={[
                      {
                        label: t('swap.swapButton'),
                        key: 'swap',
                        disabled: isActionDisabled,
                      },
                    ]}
                    onClick={submitForm}
                    renderContent={(onSubmit, onCancel, isLoading, error) => {
                      if (!!requireTokenApproval) {
                        return (
                          <ModalApproveToken
                            onSubmit={() => {
                              onClickSwap && onClickSwap();
                            }}
                          />
                        );
                      }

                      return (
                        <>
                          <SummaryList title={t('swap.swapReviewTitle')} list={summaryList} />
                          <div className="flex-end">
                            <Button
                              htmlType="submit"
                              type="primary"
                              shape="round"
                              size="large"
                              className={styles.swapButton}
                              loading={isSubmitting || isLoading}
                            >
                              {t('swap.swapButton')}
                            </Button>
                          </div>
                        </>
                      );
                    }}
                    variant={isActionDisabled ? 'disabledButton' : 'button'}
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};
