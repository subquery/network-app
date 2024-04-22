// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useAsyncMemo, useGetIndexerQuery } from '@subql/react-hooks';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { limitContract, makeCacheKey } from '../utils/limitation';
import { useEra } from './useEra';
import { parseRawEraValue } from './useEraValue';

export const useGetCapacityFromContract = (account?: string) => {
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

  const indexerData = useGetIndexerQuery({
    variables: {
      address: account || '',
    },
  });

  const sortedTotalStake = useMemo(() => {
    if (!indexerData.data?.indexer?.totalStake) return { current: BigNumber.from(0), after: BigNumber.from(0) };
    return parseRawEraValue(indexerData.data?.indexer?.totalStake, currentEra.data?.index);
  }, [indexerData.data?.indexer?.totalStake, currentEra]);
  const sortedOwnStake = useMemo(() => {
    if (!indexerData.data?.indexer?.selfStake) return { current: BigNumber.from(0), after: BigNumber.from(0) };

    return parseRawEraValue(indexerData.data?.indexer?.selfStake, currentEra.data?.index);
  }, [indexerData.data?.indexer?.selfStake, currentEra]);

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

  return {
    loading: currentLeverageLimit.loading || indexerData.loading,
    data: capacity,
    error: currentLeverageLimit.error || indexerData.error,
  };
};
