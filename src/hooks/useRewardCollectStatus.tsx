// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from '.';
import { useContracts } from '../containers';
import { AsyncMemoReturn } from './useAsyncMemo';

export function useRewardCollectStatus(indexer: string): AsyncMemoReturn<{ hasClaimedRewards: boolean } | undefined> {
  const pendingContracts = useContracts();

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    if (!contracts) return;

    const [currentEra, lastClaimedEra, lastSettledEra] = await Promise.all([
      contracts.eraManager.eraNumber(),
      (await contracts.rewardsDistributor.getRewardInfo(indexer)).lastClaimEra,
      contracts.rewardsDistributor.getLastSettledEra(indexer),
    ]);
    const rewardClaimStatus = currentEra.eq(lastClaimedEra.add(1)) && lastSettledEra.lte(lastClaimedEra);

    return { hasClaimedRewards: rewardClaimStatus };
  }, []);
}
