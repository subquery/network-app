// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { useAsyncMemo, useEraValue } from '.';
import { useContracts, useDelegation } from '../containers';
import { AsyncData } from '../utils';
import { CurrentEraValue } from './useEraValue';

export function useIndexerCapacity(indexer: string): AsyncData<CurrentEraValue<BigNumber> | undefined> {
  const pendingContracts = useContracts();
  const delegation = useDelegation(indexer, indexer);
  const indexerStake = useEraValue(delegation.data?.delegation?.amount);

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    if (!contracts) return;

    const leverageLimit = await contracts.staking.indexerLeverageLimit();
    const current = indexerStake?.current.mul(leverageLimit) || BigNumber.from(0);
    const after = (indexerStake?.after && indexerStake?.after.mul(leverageLimit)) || BigNumber.from(0);

    return { current, after };
  }, [indexerStake, pendingContracts]);
}
