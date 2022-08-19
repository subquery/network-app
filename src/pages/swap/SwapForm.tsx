// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from 'antd';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppTypography, NumberInput, Stat } from '../../components';
import styles from './SwapForm.module.css';
import * as Yup from 'yup';
import { BigNumber, BigNumberish, ethers } from 'ethers';

interface Stats {
  title: string;
  value: string;
  tooltip?: string;
}

interface SwapPair {
  from: string;
  fromMax: BigNumberish;
  to: string;
  toMax: BigNumberish;
}

interface ISwapForm {
  stats: Array<Stats>;
  pair: SwapPair;
  fromRate?: number;
}

interface PairFrom {
  from: string;
  to: string;
}

const FROM_INPUT_ID = 'from';
const TO_INPUT_ID = 'to';

export const SwapForm: React.FC<ISwapForm> = ({ stats, pair, fromRate = 1 }) => {
  const { t } = useTranslation();
  const initialPairValues: PairFrom = { from: '1', to: fromRate.toString() };

  // TODO: update limitation
  const SwapFormSchema = Yup.object().shape({
    from: Yup.string()
      .required()
      .test('isValid', 'From should be greater than 0.', (from) => (from ? BigNumber.from(from).gt('0') : false))
      .test('isValid', 'From should be smaller than max amount.', (from) =>
        from ? BigNumber.from(from).lte(pair.fromMax) : false,
      )
      .typeError('Please input valid from amount.'),
    to: Yup.string()
      .required()
      .test('isValid', 'To should be greater than 0.', (to) => (to ? BigNumber.from(to).gt('0') : false))
      .test('isValid', 'TO should be smaller than to amount.', (to) =>
        to ? BigNumber.from(to).lte(pair.toMax) : false,
      )
      .typeError('Please input valid to amount.'),
  });

  return (
    <div className={styles.container}>
      <div className={styles.statsContainer}>
        {stats.map((statsItem) => (
          <div className={styles.stats} key={statsItem.title}>
            <Stat title={statsItem.title} value={statsItem.value} tooltip={statsItem.tooltip} />
          </div>
        ))}
      </div>

      <AppTypography className={styles.dataUpdateText}>{t('swap.dataUpdateEvery5Min')}</AppTypography>

      <div>
        <Formik
          initialValues={initialPairValues}
          validationSchema={SwapFormSchema}
          onSubmit={(values, actions) => {
            // TODO: Form submit action
            actions.setSubmitting(false);
          }}
          // validateOnMount
        >
          {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, resetForm, errors }) => {
            console.log('values', values);
            console.log('errors', errors);
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
                  onChange={(value) => setFieldValue(FROM_INPUT_ID, value)}
                  errorMsg={errors[FROM_INPUT_ID]}
                  onClickMax={(value) => {
                    setErrors({ [FROM_INPUT_ID]: undefined });
                    setFieldValue(FROM_INPUT_ID, value);
                  }}
                />
                <NumberInput
                  id={TO_INPUT_ID}
                  name={TO_INPUT_ID}
                  title={t('swap.to')}
                  unit={pair.to}
                  maxAmount={pair.toMax}
                  stringMode
                  value={values.to}
                  onChange={(value) => setFieldValue(TO_INPUT_ID, value)}
                  errorMsg={errors[TO_INPUT_ID]}
                  onClickMax={(value) => {
                    setErrors({ [TO_INPUT_ID]: undefined });
                    setFieldValue(TO_INPUT_ID, value);
                  }}
                />

                <div className={styles.swapAction}>
                  <Button
                    htmlType="submit"
                    type="primary"
                    shape="round"
                    size="large"
                    className={styles.swapButton}
                    disabled={!isValid}
                  >
                    {t('swap.swapButton')}
                  </Button>
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
};
