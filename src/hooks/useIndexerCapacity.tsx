// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';

import { useWeb3Store } from 'src/stores';

import { useDelegation, useIndexer } from '../containers';
import { AsyncMemoReturn } from './useAsyncMemo';
import { CurrentEraValue } from './useEraValue';
import { useAsyncMemo, useEraValue } from '.';

export function useIndexerCapacity(address: string): AsyncMemoReturn<CurrentEraValue<BigNumber> | undefined> {
  const { contracts } = useWeb3Store();
  const delegation = useDelegation(address, address);
  const indexerStake = useEraValue(delegation.data?.delegation?.amount);
  const indexer = useIndexer({ address: address });
  const indexerTotalStake = useEraValue(indexer?.data?.indexer?.totalStake);

  return useAsyncMemo(async () => {
    if (!contracts) return;

    const leverageLimit = await contracts.staking.indexerLeverageLimit();

    const { current: stakeCurr, after: stakeAfter } = indexerStake || {};
    const { current: totalStakeCurr, after: totalStakeAfter } = indexerTotalStake || {};

    const current = stakeCurr?.mul(leverageLimit).sub(totalStakeCurr || 0) || BigNumber.from(0);
    const after = stakeAfter?.mul(leverageLimit).sub(totalStakeAfter || 0) || BigNumber.from(0);

    return { current, after };
  }, [indexerStake, contracts]);
}
