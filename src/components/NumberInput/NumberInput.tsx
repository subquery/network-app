// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { InputNumber, InputNumberProps, Button } from 'antd';
import styles from './NumberInput.module.css';
import { AppTypography } from '../Typography';
import { BigNumberish } from 'ethers';
import { isUndefined } from '../../utils';

interface NumberInputProps extends InputNumberProps {
  inputParams?: InputNumberProps;
  title?: string;
  tooltip?: string;
  description?: string;
  subDescription?: string;
  unit?: string;
  errorMsg?: string;
  onClickMax?: (amount: number | BigNumberish) => void;
  maxAmount?: number | BigNumberish;
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
  subDescription,
  errorMsg,
  inputParams, // TODO: 1) avoid to use this one in future. Refactor existing one.
  ...inputNumberProps
}) => {
  const Suffix = () => (
    <div className={styles.prefix}>
      {maxAmount > 0 && (
        <Button shape="round" size="small" type={'primary'} onClick={() => onClickMax && onClickMax(maxAmount)}>
          Max
        </Button>
      )}
      {unit && (
        <AppTypography className={styles.unit} type="secondary">
          {unit}
        </AppTypography>
      )}
    </div>
  );

  const maxText = !isUndefined(maxAmount)
    ? maxAmountText ?? `Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`
    : undefined;
  const inputBottomText = description ?? maxText;
  const DescriptionText = ({ text }: { text: string }) => (
    <AppTypography className={styles.inputBottomText}>{text}</AppTypography>
  );

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
        status={errorMsg && 'error'}
      />

      {inputBottomText && <DescriptionText text={inputBottomText} />}
      {subDescription && <DescriptionText text={subDescription} />}
      {errorMsg && <ErrorText />}
    </div>
  );
};
