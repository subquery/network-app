// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import { IndexerFieldsFragment } from '@subql/network-query';
import { useAsyncMemo, useGetIndexerLazyQuery } from '@subql/react-hooks';
import { BigNumber } from 'ethers';

import { limitContract, makeCacheKey } from '../utils/limitation';
import { useEra } from './useEra';
import { parseRawEraValue } from './useEraValue';

export const useGetCapacityFromContract = (account?: string, indexerInfo?: IndexerFieldsFragment | null) => {
  // const { contracts } = useWeb3Store();
  const { currentEra } = useEra();
  const [fetchIndexerLeverageLimit] = useLazyQuery<{ cach: { value: string } }>(gql`
    query {
      cach(id: "indexerLeverageLimit") {
        value
      }
    }
  `);
  const currentLeverageLimit = useAsyncMemo(async () => {
    const leverageLimit = await limitContract(
      () => fetchIndexerLeverageLimit(),
      makeCacheKey('indexerLeverageLimit'),
      0,
    );

    if (!leverageLimit.data) return 12;

    return leverageLimit.data?.cach.value;
  }, []);

  const [fetchIndexerData, indexerDataLazy] = useGetIndexerLazyQuery({
    variables: {
      address: account || '',
    },
  });

  const indexerData = useMemo(() => {
    return indexerInfo || indexerDataLazy.data?.indexer;
  }, [indexerDataLazy, indexerInfo]);

  const sortedTotalStake = useMemo(() => {
    if (!indexerData?.totalStake) return { current: BigNumber.from(0), after: BigNumber.from(0) };
    return parseRawEraValue(indexerData?.totalStake, currentEra.data?.index);
  }, [indexerData?.totalStake, currentEra]);
  const sortedOwnStake = useMemo(() => {
    if (!indexerData?.selfStake) return { current: BigNumber.from(0), after: BigNumber.from(0) };

    return parseRawEraValue(indexerData?.selfStake, currentEra.data?.index);
  }, [indexerData?.selfStake, currentEra]);

  const capacity = useMemo(() => {
    return {
      current:
        sortedOwnStake.current.mul(currentLeverageLimit.data?.toString() || '0').sub(sortedTotalStake.current) ||
        BigNumber.from(0),
      after:
        sortedOwnStake.after
          ?.mul(currentLeverageLimit.data?.toString() || '0')
          .sub(sortedTotalStake.after?.toString() || '0') || BigNumber.from(0),
    };
  }, [sortedOwnStake, sortedTotalStake, currentLeverageLimit]);

  useEffect(() => {
    if (!indexerInfo) {
      fetchIndexerData();
    }
  }, [indexerInfo]);

  return {
    loading: currentLeverageLimit.loading || indexerDataLazy.loading,
    data: capacity,
    error: currentLeverageLimit.error || indexerDataLazy.error,
  };
};
