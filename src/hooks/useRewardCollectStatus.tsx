// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3Store } from 'src/stores';

import { AsyncMemoReturn } from './useAsyncMemo';
import { useAsyncMemo } from '.';

export function useRewardCollectStatus(indexer: string): AsyncMemoReturn<{ hasClaimedRewards: boolean } | undefined> {
  const { contracts } = useWeb3Store();

  return useAsyncMemo(async () => {
    if (!contracts) return;

    const [currentEra, lastClaimedEra, lastSettledEra] = await Promise.all([
      contracts.eraManager.eraNumber(),
      (await contracts.rewardsDistributer.getRewardInfo(indexer)).lastClaimEra,
      contracts.rewardsStaking.getLastSettledEra(indexer),
    ]);
    const rewardClaimStatus = currentEra.eq(lastClaimedEra.add(1)) && lastSettledEra.lte(lastClaimedEra);

    return { hasClaimedRewards: rewardClaimStatus };
  }, [contracts]);
}
