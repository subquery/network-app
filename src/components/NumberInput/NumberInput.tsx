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
  inputParams, // TODO: 1) avoid to use this one in future. Refactor existing one.
  ...inputNumberProps
}) => {
  const Suffix = () => (
    <div className={styles.prefix}>
      {unit && <AppTypography className={styles.unit}>{unit}</AppTypography>}
      {maxAmount > 0 && (
        <Button shape="round" size="large" onClick={() => onClickMax && onClickMax(maxAmount)}>
          Max
        </Button>
      )}
    </div>
  );

  const InputBottomText = () => {
    const maxText =
      maxAmount > 0
        ? maxAmountText ?? `Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`
        : undefined;
    const inputBottomText = maxText ?? description;
    if (inputBottomText) {
      return <AppTypography className={styles.inputBottomText}>{inputBottomText}</AppTypography>;
    }

    return <></>;
  };

  return (
    <div className={styles.input}>
      {title && <AppTypography tooltip={tooltip}>{title}</AppTypography>}

      <InputNumber
        addonAfter={<Suffix />}
        {...inputParams}
        {...inputNumberProps}
        className={styles.inputNumber}
        size="large"
      />

      <InputBottomText />
    </div>
  );
};
