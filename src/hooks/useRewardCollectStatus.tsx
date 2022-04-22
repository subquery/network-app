// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from '.';
import { useContracts } from '../containers';
import { AsyncData } from '../utils';

export function useRewardCollectStatus(indexer: string): AsyncData<{ hasClaimedRewards: boolean } | undefined> {
  const pendingContracts = useContracts();

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    if (!contracts) return;

    const [currentEra, lastClaimedEra, lastSettledEra] = await Promise.all([
      contracts.eraManager.eraNumber(),
      contracts.rewardsDistributor.getLastClaimEra(indexer),
      contracts.rewardsDistributor.getLastSettledEra(indexer),
    ]);
    const rewardClaimStatus = currentEra.eq(lastClaimedEra.add(1)) && lastSettledEra.lte(lastClaimedEra);

    return { hasClaimedRewards: rewardClaimStatus };
  }, []);
}
