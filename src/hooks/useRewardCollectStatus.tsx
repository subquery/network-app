// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from 'react';
import { useCallback } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import BigNumberJs from 'bignumber.js';
import { toChecksumAddress } from 'ethereum-checksum-address';

import { useWeb3Store } from 'src/stores';

import { useEra } from './useEra';

export function useRewardCollectStatus(
  indexer: string,
  lazy = false,
): {
  hasClaimedRewards: boolean;
  checkIfHasClaimed: (lastSettledEra: string | number, curEra?: number) => boolean;
  refetch: (_?: boolean) => Promise<boolean>;
  loading: boolean;
  // for compatibility
  data: {
    hasClaimedRewards: boolean;
  };
} {
  const { currentEra } = useEra();
  const { contracts } = useWeb3Store();
  const [hasClaimedRewards, setHasClaimedRewards] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fetchClaimedAndSettledEra] = useLazyQuery<{ indexer: { lastClaimEra: string; lastSettledEra: string } }>(gql`
    query getClaimedAndSettledEra($indexerAddress: String!) {
      indexer(id: $indexerAddress) {
        lastSettledEra
      }
    }
  `);

  const checkIfHasClaimed = useCallback(
    (lastSettledEra: string | number, curEra = currentEra.data?.index || 0) => {
      const eraNumber = BigNumberJs(curEra || 0);
      const lastSettledEraBg = BigNumberJs(lastSettledEra);
      if (lastSettledEra && curEra) {
        const rewardClaimStatus = eraNumber.eq(lastSettledEraBg.plus(1));

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
          const { lastSettledEra } = res.data.indexer;
          const rewardClaimStatus = checkIfHasClaimed(lastSettledEra, currentEra.data?.index);

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
    [contracts, currentEra?.data?.index, indexer, fetchClaimedAndSettledEra, checkIfHasClaimed],
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
