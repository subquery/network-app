// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { useEra } from '../containers';
import { useMemo } from 'react';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';

export interface EraValue {
  era: number;
  value: BigNumberish;
  valueAfter: BigNumberish;
}

export function isEraValue(value: GraphQL_JSON): value is EraValue {
  return (
    !!value &&
    (value as EraValue).era !== undefined &&
    (value as EraValue).era !== null &&
    !!(value as EraValue).value &&
    !!(value as EraValue).valueAfter
  );
}

export type CurrentEraValue = { current: BigNumberish; after?: BigNumberish };

export function currentEraValueToString(
  value: CurrentEraValue,
  formatValue: (value: BigNumberish) => string = (v) => v.toString(),
): string {
  const after = value.after ? ` (${formatValue(value.after)})` : '';
  return `${formatValue(value.current)}${after}`;
}

export function useEraValue(value: GraphQL_JSON): CurrentEraValue | undefined {
  const { currentEra } = useEra();

  return useMemo(() => {
    if (!value) {
      return undefined;
    }

    assert(isEraValue(value), `Value is not of type EraValue: ${JSON.stringify(value)}`);
    if (currentEra?.index && currentEra.index > value.era) {
      return { current: value.valueAfter };
    }

    const after = BigNumber.from(value.value).eq(BigNumber.from(value.valueAfter)) ? undefined : value.valueAfter;

    return { current: value.value, after };
  }, [currentEra, value]);
}
