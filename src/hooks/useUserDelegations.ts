// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { formatEther } from '@ethersproject/units';
import { useDelegator, useEra } from '../containers';
import { AsyncData, mapAsync, mergeAsync } from '../utils';
import { CurrentEraValue, mapEraValue, parseRawEraValue } from './useEraValue';

export function useUserDelegations(account?: string | null): AsyncData<CurrentEraValue<string>> {
  const totalDelegations = useDelegator({ address: account ?? '' });
  const { currentEra } = useEra();

  return mapAsync(
    ([d, era]) =>
      d?.delegator?.totalDelegations
        ? mapEraValue(parseRawEraValue(d.delegator.totalDelegations, era?.index), (v) => formatEther(v ?? 0))
        : { current: '0' },
    mergeAsync(totalDelegations, currentEra),
  );
}
