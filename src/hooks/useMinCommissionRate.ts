// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useAsyncMemo } from '@subql/react-hooks';
import { limitContract } from '@utils/limitation';
import BigNumber from 'bignumber.js';

import { useWeb3Store } from 'src/stores';

export const useMinCommissionRate = () => {
  const { contracts } = useWeb3Store();

  const minCommission = useAsyncMemo(async () => {
    if (!contracts) return 35;
    const minConmmissionRate = await limitContract(
      () => contracts.indexerRegistry.minimumCommissionRate(),
      'minCommissionRate',
    );

    return BigNumber(minConmmissionRate.toString()).toNumber();
  }, [contracts]);

  const getDisplayedCommission = useCallback(
    (commission: string | number): number => {
      if (BigNumber(commission).lt(minCommission.data || 35)) {
        return minCommission.data || 35;
      }

      return BigNumber(commission).toNumber();
    },
    [minCommission.data],
  );

  return {
    minCommission: minCommission.data,
    loading: minCommission.loading,
    getDisplayedCommission,
  };
};
