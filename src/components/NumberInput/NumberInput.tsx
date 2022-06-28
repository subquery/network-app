// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { InputNumber, InputNumberProps, Button } from 'antd';
import { Typography } from '@subql/react-ui';
import styles from './NumberInput.module.css';
import { Text } from '../Text';

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
  inputParams, // TODO: 1) avoid to use this one in future. Refactor existing one.
  ...inputNumberProps
}) => {
  const Suffix = () => (
    <div className={styles.prefix}>
      {unit && <Typography className={styles.unit}>{unit}</Typography>}
      {maxAmount > 0 && (
        <Button shape="round" size="large" onClick={() => onClickMax && onClickMax(maxAmount)}>
          Max
        </Button>
      )}
    </div>
  );

  return (
    <div className={styles.input}>
      {title && <Text tooltip={tooltip}>{title}</Text>}
      <div>
        <InputNumber
          addonAfter={<Suffix />}
          {...inputParams}
          {...inputNumberProps}
          className={styles.inputNumber}
          size="large"
        />
      </div>
      {maxAmount > 0 && (
        <Typography className={styles.inputBottomText} variant="medium">
          {maxAmountText ?? `Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`}
        </Typography>
      )}
    </div>
  );
};
