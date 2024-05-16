// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useMemo } from 'react';
import TokenTooltip from '@components/TokenTooltip/TokenTooltip';
import { Typography } from '@subql/components';
import { TOKEN } from '@utils';
import { Button, InputNumber, InputNumberProps } from 'antd';
import BigNumber from 'bignumber.js';
import { BigNumberish } from 'ethers';
import { isString } from 'lodash-es';

import styles from './NumberInput.module.less';

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
        {unit && (
          <Typography
            className={styles.unit}
            variant="medium"
            type="secondary"
            key="token"
            style={{ color: 'var(--sq-gray500)' }}
          >
            {unit}
          </Typography>
        )}

        {BigNumber(maxAmount.toString()).gt(0) && (
          <Button
            ghost
            shape="round"
            size="small"
            type={'primary'}
            onClick={() => {
              onClickMax && onClickMax(BigNumber(maxAmount.toString()).toFixed());
            }}
            disabled={inputParams?.disabled}
          >
            Max
          </Button>
        )}
      </div>
    );
  }, [maxAmount, inputParams, unit]);

  const maxText = useMemo(() => {
    if (BigNumber(maxAmount.toString()).gt(0)) {
      const text = `Current ${unit === '%' ? 'rate' : 'balance'}: ${maxAmount ?? ''} ${unit ?? ''}`;
      if (unit !== '%') {
        return (
          <>
            {text} <TokenTooltip></TokenTooltip>
          </>
        );
      }
      return text;
    }
    return '';
  }, [maxAmount, unit]);

  const inputBottomText = useMemo(() => description ?? maxAmountText ?? maxText, [description, maxAmountText]);
  const DescriptionText = ({ text }: { text: string }) => (
    <Typography className={styles.inputBottomText} variant="medium">
      {text}
    </Typography>
  );

  const ErrorText = () => (
    <Typography variant="medium" type="danger">
      {errorMsg}
    </Typography>
  );

  return (
    <div className={styles.input}>
      {title && (
        <Typography tooltip={tooltip} className={styles.inputTitle}>
          {title}
        </Typography>
      )}

      <InputNumber
        addonAfter={<Suffix />}
        {...inputParams}
        {...inputNumberProps}
        className={styles.inputNumber}
        size="large"
        status={errorMsg && 'error'}
        controls={false}
      />

      {inputBottomText &&
        (isString(inputBottomText) ? (
          <Typography className={styles.inputBottomText} variant="medium">
            {inputBottomText}
          </Typography>
        ) : (
          inputBottomText
        ))}
      {subDescription && <DescriptionText text={subDescription} />}
      {errorMsg && <ErrorText />}
    </div>
  );
};
