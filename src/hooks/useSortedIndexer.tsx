// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useEra, useIndexer, useWeb3 } from '../containers';
import { convertBigNumberToNumber, convertStringToNumber, formatEther, toPercentage } from '../utils';
import { convertRawEraValue, parseRawEraValue, RawEraValue, useEraValue } from './useEraValue';

type SortedValue = {
  current: number | string | undefined;
  after: number | string | undefined;
  delegator?: string;
  indexer?: string;
};

interface UseSortedIndexerReturn {
  loading: boolean;
  commission: SortedValue;
  totalStake: SortedValue;
  ownStake: SortedValue;
  totalDelegations: SortedValue;
  delegationList: SortedValue[];
}

export function useSortedIndexer(account: string): UseSortedIndexerReturn {
  const { currentEra } = useEra();
  const indexerData = useIndexer({ address: account });
  console.log('indexerData', indexerData);

  const { loading, data: indexer } = indexerData;

  const commission = useEraValue(indexer?.indexer?.commission ?? null);
  const sortedCurCommission = convertBigNumberToNumber(commission?.current ?? 0);
  const sortedNextCommission = convertBigNumberToNumber(commission?.after ?? 0);
  const sortedCommission = { current: toPercentage(sortedCurCommission), after: toPercentage(sortedNextCommission) };

  const totalStake = useEraValue(indexer?.indexer?.totalStake ?? null);
  const sortedCurTotalStake = formatEther(totalStake?.current ?? 0);
  const sortedAfterTotalStake = formatEther(totalStake?.after ?? 0);
  const sortedTotalStake = {
    current: convertStringToNumber(sortedCurTotalStake),
    after: convertStringToNumber(sortedAfterTotalStake),
  };

  const delegations = indexer?.indexer?.delegations?.nodes ?? [];
  const sortedDelegationList = delegations.map((delegation) => {
    const sortedDelegation = convertRawEraValue(delegation?.amount as RawEraValue);
    const parsedEraValue = parseRawEraValue(sortedDelegation, currentEra.data?.index);
    const current = convertStringToNumber(formatEther(parsedEraValue?.current));
    const after = convertStringToNumber(formatEther(parsedEraValue?.after));
    return { current, after, delegator: delegation?.delegatorAddress, indexer: delegation?.indexerAddress };
  });

  const sortedOwnStake = sortedDelegationList.filter((delegation) => delegation.delegator === account)[0];

  const sortedTotalCurDelegation = sortedTotalStake?.current - sortedOwnStake?.current;
  const sortedTotalAfterDelegation = sortedTotalStake?.after - sortedOwnStake?.after;
  const sortedTotalDelegations = { current: sortedTotalCurDelegation, after: sortedTotalAfterDelegation };

  return {
    loading,
    commission: sortedCommission,
    totalStake: sortedTotalStake,
    ownStake: sortedOwnStake,
    totalDelegations: sortedTotalDelegations,
    delegationList: sortedDelegationList,
  };
}
