// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { cachedResult, limitContract, limitQueue } from '@utils/limitation';

import { useWeb3Store } from 'src/stores';

import { AsyncMemoReturn } from './useAsyncMemo';
import { useAsyncMemo } from '.';

export function useRewardCollectStatus(indexer: string): AsyncMemoReturn<{ hasClaimedRewards: boolean } | undefined> {
  const { contracts } = useWeb3Store();
  const lastClaimedKey = `indexer-lastClaimedEra-${indexer}`;
  const lastSettledKey = `indexer-lastSettledEra-${indexer}`;

  return useAsyncMemo(async () => {
    if (!contracts) return;
    const lastClaimedEra =
      cachedResult.get(lastClaimedKey) ||
      (await limitQueue.add(() => contracts.rewardsDistributor.getRewardInfo(indexer)));
    const lastSettledEra =
      cachedResult.get(lastSettledKey) ||
      (await limitQueue.add(() => contracts.rewardsStaking.getLastSettledEra(indexer)));

    cachedResult.set(lastClaimedKey, lastClaimedEra);
    cachedResult.set(lastSettledKey, lastSettledEra);

    const currentEra = await limitContract(() => contracts.eraManager.eraNumber(), 'eraNumber');

    if (lastClaimedEra && lastSettledEra && currentEra) {
      const rewardClaimStatus =
        currentEra.eq(lastClaimedEra.lastClaimEra.add(1)) && lastSettledEra.lte(lastClaimedEra.lastClaimEra);

      return { hasClaimedRewards: rewardClaimStatus };
    }
  }, [contracts]);
}
