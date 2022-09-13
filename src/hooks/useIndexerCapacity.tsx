// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { useAsyncMemo, useEraValue } from '.';
import { useContracts, useDelegation, useIndexer } from '../containers';
import { AsyncData } from '../utils';
import { CurrentEraValue } from './useEraValue';

export function useIndexerCapacity(address: string): AsyncData<CurrentEraValue<BigNumber> | undefined> {
  const pendingContracts = useContracts();
  const delegation = useDelegation(address, address);
  const indexerStake = useEraValue(delegation.data?.delegation?.amount);
  const indexer = useIndexer({ address: address });
  const indexerTotalStake = useEraValue(indexer?.data?.indexer?.totalStake);

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    if (!contracts) return;

    const leverageLimit = await contracts.staking.indexerLeverageLimit();

    const { current: stakeCurr, after: stakeAfter } = indexerStake || {};
    const { current: totalStakeCurr, after: totalStakeAfter } = indexerTotalStake || {};

    const current = stakeCurr?.mul(leverageLimit).sub(totalStakeCurr || 0) || BigNumber.from(0);
    const after = stakeAfter?.mul(leverageLimit).sub(totalStakeAfter || 0) || BigNumber.from(0);

    return { current, after };
  }, [indexerStake, pendingContracts]);
}
