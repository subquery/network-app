// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from 'react-i18next';
import { NumberInput } from '@components/NumberInput';
import { Spinner, Typography } from '@subql/components';
import { Button } from 'antd';
import { BigNumberish } from 'ethers';
import { Formik } from 'formik';
import * as yup from 'yup';

const poolDelegateSchema = yup.object({
  amount: yup.number().defined().moreThan(0),
});
export type PoolDelegateData = yup.Asserts<typeof poolDelegateSchema>;

export function Form({
  sqtBalance,
  error,
  onSubmit,
}: {
  sqtBalance: BigNumberish | undefined;
  error?: string;
  onSubmit: (data: PoolDelegateData) => void | Promise<void>;
}) {
  const { t } = useTranslation();

  return (
    <Formik validationSchema={poolDelegateSchema} initialValues={{ amount: 0 }} onSubmit={onSubmit}>
      {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, resetForm }) => {
        return (
          <>
            <div className="fullWidth">
              <NumberInput
                title={t('delegate.delegateAmount')}
                maxAmount={sqtBalance}
                inputParams={{
                  name: 'input',
                  id: 'input',
                  onChange: (value) => {
                    setErrors({ amount: undefined });
                    setFieldValue('amount', value);
                  },
                  value: values.amount,
                  disabled: isSubmitting,
                  stringMode: true,
                  // max: account && sortedMaxAmount ? sortedMaxAmount : undefined,
                  min: 0,
                }}
                onClickMax={(value) => {
                  setErrors({ amount: undefined });
                  setFieldValue('amount', value);
                }}
              />
            </div>
            <Typography className={'errorText'}>{error}</Typography>
            <div className="flex flex-end">
              <Button
                onClick={submitForm}
                loading={isSubmitting}
                disabled={!isSubmitting && !isValid && values.amount <= 0}
                type="primary"
                shape="round"
                size="large"
              >
                {t('delegate.title')}
              </Button>
            </div>
          </>
        );
      }}
    </Formik>
  );
}
