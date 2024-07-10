// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo } from 'react';
import { IndexerFieldsFragment } from '@subql/network-query';
import { useAsyncMemo, useGetIndexerLazyQuery } from '@subql/react-hooks';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { limitContract, makeCacheKey } from '../utils/limitation';
import { useEra } from './useEra';
import { parseRawEraValue } from './useEraValue';

export const useGetCapacityFromContract = (account?: string, indexerInfo?: IndexerFieldsFragment | null) => {
  const { contracts } = useWeb3Store();
  const { currentEra } = useEra();

  const currentLeverageLimit = useAsyncMemo(async () => {
    if (!contracts) return 12;
    const leverageLimit = await limitContract(
      () => contracts.staking.indexerLeverageLimit(),
      makeCacheKey('indexerLeverageLimit'),
      0,
    );

    return leverageLimit;
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
