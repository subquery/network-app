// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEra } from '@hooks';
import { useGetDelegationQuery, useGetIndexerQuery } from '@subql/react-hooks';

import {
  AsyncData,
  convertBigNumberToNumber,
  convertStringToNumber,
  divToPercentage,
  formatEther,
  mergeAsync,
} from '../utils';
import { COMMISSION_DIV_UNIT } from './useCommissionRate';
import { CurrentEraValue, mapEraValue, parseRawEraValue } from './useEraValue';

export const getCommission = (value: unknown, curEra: number | undefined): CurrentEraValue<string> => {
  const commission = parseRawEraValue(value, curEra);

  const sortedCommission = mapEraValue(commission, (v) =>
    divToPercentage(convertBigNumberToNumber(v ?? 0), COMMISSION_DIV_UNIT),
  );
  return sortedCommission;
};

export const getTotalStake = (value: unknown, curEra: number | undefined): CurrentEraValue<number> => {
  const totalStake = parseRawEraValue(value, curEra);
  const sortedTotalStake = mapEraValue(totalStake, (v) => convertStringToNumber(formatEther(v ?? 0)));
  return sortedTotalStake;
};

export const getOwnStake = (value: unknown, curEra: number | undefined): CurrentEraValue<number> => {
  const ownStake = parseRawEraValue(value, curEra);
  const sortedOwnStake = mapEraValue(ownStake, (v) => convertStringToNumber(formatEther(v ?? 0)));
  return sortedOwnStake;
};

export const getCapacity = (value: unknown, curEra: number | undefined): CurrentEraValue<number> => {
  const ownStake = parseRawEraValue(value, curEra);
  const sortedCapacity = mapEraValue(ownStake, (v) => convertStringToNumber(formatEther(v ?? 0)));
  return sortedCapacity;
};

export const getDelegated = (
  totalStake: CurrentEraValue<number>,
  ownStake: CurrentEraValue<number>,
): CurrentEraValue<number> => {
  return {
    current: totalStake.current - ownStake.current,
    after: (totalStake?.after ?? 0) - (ownStake?.after ?? 0),
  };
};

export interface UseSortedIndexerReturn {
  commission: CurrentEraValue<string>;
  totalStake: CurrentEraValue<number>;
  ownStake: CurrentEraValue<number>;
  totalDelegations: CurrentEraValue<number>;
  capacity: CurrentEraValue<number>;
}

export function useSortedIndexer(account: string): AsyncData<UseSortedIndexerReturn> & { refresh?: () => void } {
  const { currentEra } = useEra();
  const indexerQueryParams = { address: account ?? '' };
  const indexerData = useGetIndexerQuery({ variables: indexerQueryParams, fetchPolicy: 'network-only' });
  const delegationQueryParams = { id: `${account ?? ''}:${account}` };
  const indexerDelegation = useGetDelegationQuery({ variables: delegationQueryParams, fetchPolicy: 'network-only' });
  const { loading, error, data } = mergeAsync(currentEra, indexerData, indexerDelegation);

  const refresh = async () => {
    indexerData.refetch();
    indexerDelegation.refetch();
  };

  if (loading) {
    return { loading: true, data: undefined };
  } else if (error) {
    return { loading: false, error: indexerData.error };
  } else if (!data) {
    return { loading: false, error: new Error('No data') };
  }

  try {
    const [currentEraValue, indexer, delegation] = data;

    if (!currentEraValue || !indexer || !delegation) {
      return { loading: true };
    }

    if (!indexer.indexer) {
      // User is not an indexer
      return { loading: false };
    }
    // note commission change will take effect at next 2 era.
    // but subql record immediate.
    const commission = getCommission(indexer.indexer.commission, currentEraValue?.index - 1);
    const totalStake = getTotalStake(indexer.indexer.totalStake, currentEraValue?.index);
    const capacity = getCapacity(indexer.indexer.capacity, currentEraValue?.index);
    const ownStake = getOwnStake(delegation.delegation?.amount, currentEraValue?.index);

    const totalDelegations = getDelegated(totalStake, ownStake);

    return {
      loading: false,
      data: {
        commission,
        totalStake,
        ownStake,
        totalDelegations,
        capacity,
      },
      refresh,
    };
  } catch (e) {
    return { loading: false, error: e as Error, refresh };
  }
}
