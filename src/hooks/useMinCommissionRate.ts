// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useAsyncMemo } from '@subql/react-hooks';
import { limitContract } from '@utils/limitation';
import BigNumber from 'bignumber.js';

import { PER_MILL } from 'src/const/const';
import { useWeb3Store } from 'src/stores';

export const useMinCommissionRate = () => {
  const { contracts } = useWeb3Store();

  const minCommission = useAsyncMemo(async () => {
    if (!contracts) return 0;
    const minConmmissionRate = await limitContract(
      () => contracts.indexerRegistry.minimumCommissionRate(),
      'minCommissionRate',
    );

    return BigNumber(minConmmissionRate.toString()).div(PER_MILL).multipliedBy(100).toNumber();
  }, [contracts]);

  const getDisplayedCommission = useCallback(
    (commission: string | number): number => {
      if (BigNumber(commission).lt(minCommission.data || 0)) {
        return minCommission.data || 0;
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
