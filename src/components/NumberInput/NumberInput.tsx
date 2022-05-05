// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { InputNumber, InputNumberProps, Button } from 'antd';
import { Typography } from '@subql/react-ui';
import styles from './NumberInput.module.css';

interface NumberInputProps {
  inputParams: InputNumberProps;
  title?: string;
  description?: string;
  unit?: string;
  onClickMax?: (amount: number) => void;
  maxAmount?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({ title, unit, maxAmount = 0, onClickMax, inputParams }) => {
  const Prefix = () => (
    <div className={styles.prefix}>
      {unit && <Typography className={styles.unit}>{unit}</Typography>}
      {maxAmount > 0 && (
        <Button shape="round" size="large" onClick={() => onClickMax && onClickMax(maxAmount)}>
          Max
        </Button>
      )}
    </div>
  );
  console.log('maxAmount', maxAmount > 0);

  return (
    <>
      {title && <Typography variant="medium">{title}</Typography>}
      <div className={styles.input}>
        <InputNumber addonAfter={<Prefix />} {...inputParams} className={styles.inputNumber} />
      </div>
      {maxAmount > 0 && (
        <Typography className={styles.inputBottomText} variant="medium">
          {`Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`}
        </Typography>
      )}
    </>
  );
};
