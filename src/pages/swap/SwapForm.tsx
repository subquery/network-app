// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button } from 'antd';
import { Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppTypography, NumberInput, Stat } from '../../components';
import styles from './SwapForm.module.css';

interface Stats {
  title: string;
  value: string;
  tooltip?: string;
}

interface SwapPair {
  from: string;
  fromMax: number;
  to: string;
  toMax: number;
}

interface ISwapForm {
  stats: Array<Stats>;
  pair: SwapPair;
}

interface PairFrom {
  from: string;
  to: string;
}

const FROM_INPUT_ID = 'from';
const TO_INPUT_ID = 'to';

export const SwapForm: React.FC<ISwapForm> = ({ stats, pair }) => {
  const { t } = useTranslation();
  const initialPairValues: PairFrom = { from: '0', to: '0' };
  const onClickMax = (id: string, value: string, onClick: (id: string, value: string) => void) => () =>
    onClick(id, value);

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
          onSubmit={(values, actions) => {
            console.log({ values, actions });
            actions.setSubmitting(false);
          }}
        >
          {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, resetForm }) => {
            return (
              <Form>
                <NumberInput
                  id={FROM_INPUT_ID}
                  name={FROM_INPUT_ID}
                  title={t('swap.from')}
                  unit={pair.from}
                  maxAmount={pair.fromMax}
                  stringMode
                  value={values.from}
                  onChange={(value) => setFieldValue(FROM_INPUT_ID, value)}
                  onClickMax={(value) => {
                    console.log('value', value);
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
                  onClickMax={(value) => {
                    console.log('value', value);
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
