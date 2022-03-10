// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useEra } from '../containers';
import { useMemo } from 'react';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { isBigNumberish } from '@ethersproject/bignumber/lib/bignumber';

type JSONBigInt = {
  type: 'bigint';
  value: string; // Hex encoded string
};

export interface EraValue<T = BigNumberish> {
  era: number;
  value: T;
  valueAfter: T;
}

// What we get from the subquery project
export type RawEraValue = EraValue<JSONBigInt>;

export type CurrentEraValue = { current: BigNumber; after?: BigNumber };

export function isEraValue<T = BigNumberish>(value: GraphQL_JSON): value is EraValue<T> {
  return (
    !!value &&
    (value as EraValue).era !== undefined &&
    (value as EraValue).era !== null &&
    !!(value as EraValue).value &&
    !!(value as EraValue).valueAfter
  );
}

function jsonBigIntToBigInt(value: JSONBigInt | BigNumberish): BigNumber {
  if (isBigNumberish(value)) {
    return BigNumber.from(value);
  }
  assert(value.type === 'bigint', 'Value is not a JSONBigInt');

  return BigNumber.from(value.value);
}

export function convertRawEraValue(raw: RawEraValue | EraValue): EraValue<BigNumber> {
  return {
    ...raw,
    value: jsonBigIntToBigInt(raw.value),
    valueAfter: jsonBigIntToBigInt(raw.valueAfter),
  };
}

export function currentEraValueToString(
  value: CurrentEraValue,
  formatValue: (value: BigNumberish) => string = (v) => v.toString(),
): string {
  const after = value.after ? ` (${formatValue(value.after)})` : '';
  return `${formatValue(value.current)}${after}`;
}

export function parseRawEraValue(
  eraValue: EraValue<BigNumber>,
  curEra: number | undefined,
): CurrentEraValue | undefined {
  if (curEra && curEra > eraValue.era) {
    return { current: eraValue.valueAfter };
  }

  const after = eraValue.value.eq(eraValue.valueAfter) ? undefined : eraValue.valueAfter;

  return { current: eraValue.value, after };
}

export function useEraValue(value: GraphQL_JSON): CurrentEraValue | undefined {
  const { currentEra } = useEra();

  return useMemo(() => {
    if (!value) {
      return undefined;
    }

    assert(isEraValue(value), `Value is not of type EraValue: ${JSON.stringify(value)}`);
    const eraValue = convertRawEraValue(value);

    return parseRawEraValue(eraValue, currentEra.data?.index);
  }, [currentEra, value]);
}
