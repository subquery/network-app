// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { useAsyncMemo, useGetDelegationQuery, useGetIndexerQuery } from '@subql/react-hooks';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { useEra } from './useEra';
import { parseRawEraValue } from './useEraValue';

export const useGetCapacityFromContract = (account?: string) => {
  const { contracts } = useWeb3Store();
  const { currentEra } = useEra();

  const currentLeverageLimit = useAsyncMemo(async () => {
    const leverageLimit = await contracts?.staking.indexerLeverageLimit();

    return leverageLimit;
  }, []);

  const indexerData = useGetIndexerQuery({
    variables: {
      address: account || '',
    },
    fetchPolicy: 'network-only',
  });

  const delegation = useGetDelegationQuery({
    variables: {
      id: `${account}:${account}`,
    },
  });

  const sortedTotalStake = useMemo(() => {
    if (!indexerData.data?.indexer?.totalStake) return { current: BigNumber.from(0), after: BigNumber.from(0) };
    return parseRawEraValue(indexerData.data?.indexer?.totalStake, currentEra.data?.index);
  }, [indexerData.data?.indexer?.totalStake, currentEra]);
  const sortedOwnStake = useMemo(() => {
    if (!delegation.data?.delegation?.amount) return { current: BigNumber.from(0), after: BigNumber.from(0) };

    return parseRawEraValue(delegation.data?.delegation?.amount, currentEra.data?.index);
  }, [delegation.data?.delegation?.amount, currentEra]);

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
