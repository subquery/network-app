// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { InputNumber, InputNumberProps, Button } from 'antd';
// import { Typography } from '@subql/react-ui';
import styles from './NumberInput.module.css';
import { AppTypography } from '../Typography';

interface NumberInputProps extends InputNumberProps {
  inputParams?: InputNumberProps;
  title?: string;
  tooltip?: string;
  description?: string;
  unit?: string;
  errorMsg?: string;
  onClickMax?: (amount: number) => void;
  maxAmount?: number;
  maxAmountText?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  title,
  tooltip,
  unit = 'SQT',
  maxAmountText,
  maxAmount = 0,
  onClickMax,
  description,
  errorMsg,
  inputParams, // TODO: 1) avoid to use this one in future. Refactor existing one.
  ...inputNumberProps
}) => {
  const Suffix = () => (
    <div className={styles.prefix}>
      {unit && (
        <AppTypography className={styles.unit} type="secondary">
          {unit}
        </AppTypography>
      )}
      {maxAmount > 0 && (
        <Button shape="round" size="large" onClick={() => onClickMax && onClickMax(maxAmount)}>
          Max
        </Button>
      )}
    </div>
  );

  const maxText =
    maxAmount > 0
      ? maxAmountText ?? `Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`
      : undefined;
  const inputBottomText = maxText ?? description;
  const InputBottomText = () => <AppTypography className={styles.inputBottomText}>{inputBottomText}</AppTypography>;

  const ErrorText = () => (
    <AppTypography className={styles.inputBottomText} type="danger">
      {errorMsg}
    </AppTypography>
  );

  return (
    <div className={styles.input}>
      {title && (
        <AppTypography tooltip={tooltip} className={styles.inputTitle}>
          {title}
        </AppTypography>
      )}

      <InputNumber
        addonAfter={<Suffix />}
        {...inputParams}
        {...inputNumberProps}
        className={styles.inputNumber}
        size="large"
      />

      {inputBottomText && <InputBottomText />}
      {errorMsg && <ErrorText />}
    </div>
  );
};
