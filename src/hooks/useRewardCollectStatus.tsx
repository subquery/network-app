// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { limitContract, makeCacheKey } from '@utils/limitation';

import { useWeb3Store } from 'src/stores';

import { AsyncMemoReturn } from './useAsyncMemo';
import { useAsyncMemo } from '.';

export function useRewardCollectStatus(indexer: string): AsyncMemoReturn<{ hasClaimedRewards: boolean } | undefined> {
  const { contracts } = useWeb3Store();
  const lastClaimedKey = makeCacheKey(indexer, { suffix: 'lastClaimed' });
  const lastSettledKey = makeCacheKey(indexer, { suffix: 'lastSettledEra' });

  return useAsyncMemo(async () => {
    if (!contracts) return;
    const lastClaimedEra = await limitContract(
      () => contracts.rewardsDistributor.getRewardInfo(indexer),
      lastClaimedKey,
    );
    const lastSettledEra = await limitContract(
      () => contracts.rewardsStaking.getLastSettledEra(indexer),
      lastSettledKey,
    );

    const currentEra = await limitContract(() => contracts.eraManager.eraNumber(), makeCacheKey('eraNumber'));

    if (lastClaimedEra && lastSettledEra && currentEra) {
      const rewardClaimStatus =
        currentEra.eq(lastClaimedEra.lastClaimEra.add(1)) && lastSettledEra.lte(lastClaimedEra.lastClaimEra);
      return { hasClaimedRewards: rewardClaimStatus };
    }
  }, [contracts]);
}
