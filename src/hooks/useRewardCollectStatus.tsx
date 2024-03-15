// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { limitContract, makeCacheKey } from '@utils/limitation';

import { useWeb3Store } from 'src/stores';

export function useRewardCollectStatus(
  indexer: string,
  lazy = false,
): {
  hasClaimedRewards: boolean;
  refetch: (_?: boolean) => Promise<boolean>;
  loading: boolean;
  // for compatibility
  data: {
    hasClaimedRewards: boolean;
  };
} {
  const { contracts } = useWeb3Store();
  const lastClaimedKey = makeCacheKey(indexer, { suffix: 'lastClaimed' });
  const lastSettledKey = makeCacheKey(indexer, { suffix: 'lastSettledEra' });

  const [hasClaimedRewards, setHasClaimedRewards] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async (_?: boolean) => {
    if (!contracts) return false;
    try {
      setLoading(true);
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

        setHasClaimedRewards(rewardClaimStatus);
        return rewardClaimStatus;
      }

      return false;
    } catch (e) {
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lazy) {
      fetchStatus();
    }
  }, [lazy, indexer, contracts]);

  return {
    hasClaimedRewards,
    data: {
      hasClaimedRewards,
    },
    refetch: fetchStatus,
    loading,
  };
}
