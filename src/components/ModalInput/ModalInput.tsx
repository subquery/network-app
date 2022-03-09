// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { InputNumber, Button } from 'antd';
import { Typography } from '@subql/react-ui';
import { useFormik } from 'formik';
import styles from './ModalInput.module.css';

/**
 * NOTE:
 * Using antd: Input/Button
 * Waiting for SubQuery components lib(also based on antD) release and replace
 */

// TODO: percentage input
// TODO: input validation

interface Props {
  inputTitle?: string;
  submitText?: string;
  maxBalance?: number;
  unit?: string;
  isLoading?: boolean;
  onSubmit: (value: any) => void;
}

export const ModalInput: React.FC<Props> = ({
  inputTitle,
  submitText,
  maxBalance,
  onSubmit,
  unit = 'SQT',
  isLoading,
}) => {
  const formik = useFormik({
    initialValues: {
      input: 0,
    },
    // TODO:validate,
    onSubmit: async (values, { resetForm }) => {
      const { input } = values;
      await onSubmit(input);
      resetForm();
    },
  });

  const Prefix = () => (
    <div className={styles.prefix}>
      {unit && <Typography className={styles.unit}>{unit}</Typography>}
      <Button
        shape="round"
        size="large"
        onClick={() => {
          formik.setFieldValue('input', maxBalance);
        }}
      >
        Max
      </Button>
    </div>
  );

  return (
    <form onSubmit={formik.handleSubmit}>
      {inputTitle && <Typography variant="medium">{inputTitle}</Typography>}
      <div className={styles.input}>
        <InputNumber
          name="input"
          id="input"
          className={styles.inputNumber}
          onChange={(value) => {
            formik.setFieldValue('input', value);
          }}
          value={formik.values.input}
          addonAfter={maxBalance && <Prefix />}
          disabled={isLoading}
        />
      </div>
      {maxBalance && (
        <Typography className={styles.balance} variant="medium">{`Balance: ${maxBalance} ${unit}`}</Typography>
      )}
      <div className={styles.btnContainer}>
        <Button
          onSubmit={formik.handleSubmit}
          htmlType="submit"
          shape="round"
          size="large"
          className={styles.submitBtn}
          loading={isLoading}
        >
          {submitText || 'Submit'}
        </Button>
      </div>
    </form>
  );
};
