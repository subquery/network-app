// Copyright 2020-2025 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTranslation } from 'react-i18next';
import { NumberInput } from '@components/NumberInput';
import { Spinner, Typography } from '@subql/components';
import { Alert, Button, Divider } from 'antd';
import { BigNumberish } from 'ethers';
import { Formik } from 'formik';
import * as yup from 'yup';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { TOKEN } from '@utils';

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

  const hours = 'TODO'; // useLockPeriod();

  return (
    <Formik validationSchema={poolDelegateSchema} initialValues={{ amount: 0 }} onSubmit={onSubmit}>
      {({ submitForm, isValid, isSubmitting, setFieldValue, setErrors, values, resetForm }) => {
        return (
          <>
            <Alert
              showIcon
              type="warning"
              style={{
                border: '1px solid #F87C4F80',
                background: '#F87C4F14',
                alignItems: 'flex-start',
              }}
              icon={<ExclamationCircleFilled style={{ color: 'var(--sq-warning)', marginTop: 4 }} />}
              message={
                <div
                  className="col-flex"
                  style={{
                    gap: 16,
                  }}
                >
                  <Typography>
                    Tokens will remain locked until the end of the unlock period of {hours} hours and the pool manager
                    has made funds available. Afterwards you will have to withdraw the unlocked funds.
                  </Typography>
                </div>
              }
            ></Alert>

            <Divider />
            <div className="fullWidth">
              <NumberInput
                title={`Enter the amount of ${TOKEN} you want to undelegate`}
                maxAmount={sqtBalance}
                maxAmountText={`Your current delegation: ${sqtBalance} ${TOKEN}`}
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
                {t('delegate.undelegate')}
              </Button>
            </div>
          </>
        );
      }}
    </Formik>
  );
}
