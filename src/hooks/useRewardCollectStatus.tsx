// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { limitContract } from '@utils/limitation';
import PQueue from 'p-queue';

import { useWeb3Store } from 'src/stores';

import { AsyncMemoReturn } from './useAsyncMemo';
import { useAsyncMemo } from '.';

const limit = new PQueue({
  concurrency: 3,
  interval: 1000,
});

export function useRewardCollectStatus(indexer: string): AsyncMemoReturn<{ hasClaimedRewards: boolean } | undefined> {
  const { contracts } = useWeb3Store();

  return useAsyncMemo(async () => {
    if (!contracts) return;

    const lastClaimedEra = await limit.add(() => contracts.rewardsDistributor.getRewardInfo(indexer));
    const lastSettledEra = await limit.add(() => contracts.rewardsStaking.getLastSettledEra(indexer));

    const currentEra = await limitContract(() => contracts.eraManager.eraNumber(), 'eraNumber');

    if (lastClaimedEra && lastSettledEra && currentEra) {
      const rewardClaimStatus =
        currentEra.eq(lastClaimedEra.lastClaimEra.add(1)) && lastSettledEra.lte(lastClaimedEra.lastClaimEra);

      return { hasClaimedRewards: rewardClaimStatus };
    }
  }, [contracts]);
}
