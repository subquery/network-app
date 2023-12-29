// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { Button, InputNumber, InputNumberProps } from 'antd';
import BigNumber from 'bignumber.js';
import { BigNumberish } from 'ethers';

import { AppTypography } from '../Typography';
import styles from './NumberInput.module.css';

interface NumberInputProps extends InputNumberProps {
  inputParams?: InputNumberProps;
  title?: string;
  tooltip?: string;
  description?: string;
  subDescription?: string;
  unit?: React.ReactNode;
  errorMsg?: string;
  onClickMax?: (amount: number | BigNumberish) => void;
  maxAmount?: number | BigNumberish;
  maxAmountText?: React.ReactNode;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  title,
  tooltip,
  unit = TOKEN,
  maxAmountText,
  maxAmount = 0,
  onClickMax,
  description,
  subDescription,
  errorMsg,
  inputParams, // TODO: 1) avoid to use this one in future. Refactor existing one.
  ...inputNumberProps
}) => {
  // this component would re-render every times
  const Suffix = React.useCallback(() => {
    return (
      <div className={styles.prefix}>
        {BigNumber(maxAmount.toString()).gt(0) && (
          <Button
            shape="round"
            size="small"
            type={'primary'}
            onClick={() => {
              onClickMax && onClickMax(maxAmount);
            }}
            disabled={inputParams?.disabled}
          >
            Max
          </Button>
        )}
        {unit && (
          <AppTypography className={styles.unit} type="secondary" key="token">
            {unit}
          </AppTypography>
        )}
      </div>
    );
  }, [maxAmount, inputParams, unit]);

  const maxText = useMemo(
    () =>
      BigNumber(maxAmount.toString()).gt(0)
        ? `Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`
        : undefined,
    [maxAmount, unit],
  );

  const inputBottomText = useMemo(() => description ?? maxAmountText ?? maxText, [description, maxAmountText]);
  const DescriptionText = ({ text }: { text: string }) => (
    <Typography className={styles.inputBottomText} variant="medium">
      {text}
    </Typography>
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

      {inputBottomText && (
        <Typography className={styles.inputBottomText} variant="medium">
          {inputBottomText}
        </Typography>
      )}
      {subDescription && <DescriptionText text={subDescription} />}
      {errorMsg && <ErrorText />}
    </div>
  );
};
