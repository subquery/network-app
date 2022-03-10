// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { useDelegation, useEra, useIndexer } from '../containers';
import {
  AsyncData,
  convertBigNumberToNumber,
  convertStringToNumber,
  formatEther,
  mergeAsync,
  toPercentage,
} from '../utils';
import { CurrentEraValue, mapEraValue, parseRawEraValue } from './useEraValue';

interface UseSortedIndexerReturn {
  commission: CurrentEraValue<string>;
  totalStake: CurrentEraValue<number>;
  ownStake: CurrentEraValue<number>;
  totalDelegations: CurrentEraValue<number>;
}

export function useSortedIndexer(account: string): AsyncData<UseSortedIndexerReturn> {
  const { currentEra } = useEra();
  const indexerData = useIndexer({ address: account });
  const indexerDelegation = useDelegation(account, account);
  console.log('indexerData', indexerData);

  const { loading, error, data } = mergeAsync(currentEra, indexerData, indexerDelegation);

  if (loading) {
    return { loading: true, data: undefined };
  } else if (error) {
    return { loading: false, error: indexerData.error };
  } else if (!data) {
    return { loading: false, error: new Error('No data') };
  }

  const [currentEraValue, indexer, delegation] = data;

  if (!currentEraValue || !indexer || !delegation) {
    return { loading: false, error: new Error('Missing expected async data') };
  }

  try {
    const commission = parseRawEraValue(indexer.indexer?.commission, currentEraValue?.index);
    const totalStake = parseRawEraValue(indexer.indexer?.totalStake, currentEraValue?.index);
    const ownStake = parseRawEraValue(delegation.delegation?.amount, currentEraValue?.index);

    const sortedCommission = mapEraValue(commission, (v) => toPercentage(convertBigNumberToNumber(v ?? 0)));
    const sortedTotalStake = mapEraValue(totalStake, (v) => convertStringToNumber(formatEther(v ?? 0)));
    const sortedOwnStake = mapEraValue(ownStake, (v) => convertStringToNumber(formatEther(v ?? 0)));

    const totalDelegations = mapEraValue(
      {
        current: totalStake?.current.sub(ownStake?.current ?? 0) ?? BigNumber.from(0),
        after: totalStake?.after?.sub(ownStake?.after ?? 0) ?? BigNumber.from(0),
      },
      (v) => convertStringToNumber(formatEther(v ?? 0)),
    );

    return {
      loading: false,
      data: {
        commission: sortedCommission,
        totalStake: sortedTotalStake,
        ownStake: sortedOwnStake,
        totalDelegations,
      },
    };
  } catch (e) {
    return { loading: false, error: e as Error };
  }
}
