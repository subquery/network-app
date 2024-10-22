// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import BigNumberJs from 'bignumber.js';
import { toChecksumAddress } from 'ethereum-checksum-address';

import { useEra } from './useEra';

export function useRewardCollectStatus(
  indexer: string,
  lazy = false,
): {
  hasClaimedRewards: boolean;
  checkIfHasClaimed: (lastClaimEra: string | number, lastSettledEra: string | number, curEra?: number) => boolean;
  refetch: (_?: boolean) => Promise<boolean>;
  loading: boolean;
  // for compatibility
  data: {
    hasClaimedRewards: boolean;
  };
} {
  const { currentEra } = useEra();

  const [hasClaimedRewards, setHasClaimedRewards] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fetchClaimedAndSettledEra] = useLazyQuery<{ indexer: { lastClaimEra: string; lastSettledEra: string } }>(gql`
    query getClaimedAndSettledEra($indexerAddress: String!) {
      indexer(id: $indexerAddress) {
        lastClaimEra
        lastSettledEra
      }
    }
  `);

  const checkIfHasClaimed = useCallback(
    (lastClaimEra: string | number, lastSettledEra: string | number, curEra = currentEra.data?.index || 0) => {
      const eraNumber = BigNumberJs(curEra || 0);
      const lastClaimEraBg = BigNumberJs(lastClaimEra);
      const lastSettledEraBg = BigNumberJs(lastSettledEra);
      if (lastClaimEra && lastSettledEra && curEra) {
        const rewardClaimStatus = eraNumber.eq(lastClaimEraBg.plus(1)) && lastSettledEraBg.lte(lastClaimEra);

        return rewardClaimStatus;
      }

      return false;
    },
    [currentEra.data?.index],
  );

  const fetchStatus = useCallback(
    async (_?: boolean) => {
      try {
        setLoading(true);
        const res = await fetchClaimedAndSettledEra({
          variables: {
            indexerAddress: toChecksumAddress(indexer),
          },
        });

        if (res.data?.indexer) {
          const { lastClaimEra, lastSettledEra } = res.data.indexer;
          const rewardClaimStatus = checkIfHasClaimed(lastClaimEra, lastSettledEra, currentEra.data?.index);

          setHasClaimedRewards(rewardClaimStatus);
          return rewardClaimStatus;
        }

        return false;
      } catch (e) {
        return false;
      } finally {
        setLoading(false);
      }
    },
    [currentEra?.data?.index, indexer, fetchClaimedAndSettledEra, checkIfHasClaimed],
  );

  useEffect(() => {
    if (!lazy && currentEra.data?.index) {
      fetchStatus();
    }
  }, [lazy, indexer, fetchClaimedAndSettledEra, currentEra?.data?.index, checkIfHasClaimed]);

  return {
    hasClaimedRewards,
    checkIfHasClaimed,
    data: {
      hasClaimedRewards,
    },
    refetch: fetchStatus,
    loading,
  };
}
