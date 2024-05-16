// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/components';
import { Button, InputNumberProps } from 'antd';
import { useFormik } from 'formik';

import { TOKEN } from '../../utils';
import { parseError } from '../../utils/parseError';
import { NumberInput } from '../NumberInput';
import styles from './ModalInput.module.css';

/**
 * NOTE:
 * Using antd: Input/Button
 * Waiting for SubQuery components lib(also based on antD) release and replace
 */

// TODO: percentage input
// TODO: input validation

interface Props extends InputNumberProps {
  inputTitle?: string;
  submitText?: string;
  curAmount?: number | string;
  showMaxButton?: boolean;
  inputBottomText?: React.ReactNode;
  failureModalText?: string;
  unit?: string;
  isLoading?: boolean;
  max?: number;
  min?: number;
  onSubmit: (value: any) => void;
  onError?: () => void;
  description?: string;
  extra?: React.ReactNode;
}

export const ModalInput: React.FC<Props> = ({
  inputTitle,
  submitText,
  onSubmit,
  onError,
  unit = TOKEN,
  isLoading,
  curAmount,
  showMaxButton,
  inputBottomText,
  failureModalText,
  min,
  max,
  ...inputNumberPros
}) => {
  const maxInputNumber = curAmount || max;
  const formik = useFormik({
    initialValues: {
      input: 0,
    },
    onSubmit: async (values, { resetForm, setErrors }) => {
      const { input } = values;
      try {
        await onSubmit(input);
        resetForm();
      } catch (error: any) {
        setErrors({ input: parseError(error) });
        onError && onError();
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <NumberInput
        {...inputNumberPros}
        title={inputTitle}
        unit={unit}
        inputParams={{
          name: 'input',
          id: 'input',
          onChange: (value) => {
            formik.setErrors({ input: undefined });
            formik.setFieldValue('input', value);
          },
          value: formik.values.input,
          disabled: isLoading,
          max: maxInputNumber,
          min: min,
        }}
        maxAmountText={inputBottomText}
        maxAmount={maxInputNumber}
        onClickMax={(value) => {
          formik.setErrors({ input: undefined });
          formik.setFieldValue('input', value);
        }}
      />

      <Typography className={styles.inputError} variant="medium">
        {failureModalText || formik.errors?.input}
      </Typography>
      <div className={styles.btnContainer}>
        <Button
          onSubmit={() => formik.handleSubmit()}
          htmlType="submit"
          shape="round"
          size="large"
          className={styles.submitBtn}
          loading={isLoading}
          disabled={!(formik.values.input > 0)}
        >
          {submitText || 'Submit'}
        </Button>
      </div>
    </form>
  );
};
