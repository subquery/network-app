// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { useAsyncMemo, useEraValue } from '.';
import { useContracts, useDelegation } from '../containers';
import { AsyncData } from '../utils';

export function useIndexerCapacity(indexer: string): AsyncData<BigNumber | undefined> {
  const pendingContracts = useContracts();
  const delegation = useDelegation(indexer, indexer);
  const indexerStake = useEraValue(delegation.data?.delegation?.amount);

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    if (!contracts) return;

    const leverageLimit = await contracts.staking.indexerLeverageLimit();

    return indexerStake?.current.mul(leverageLimit);
  }, [indexerStake, pendingContracts]);
}
