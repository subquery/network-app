// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
  const fetchStatus = async (_?: boolean) => {
    return true;
  };

  return {
    hasClaimedRewards: true,
    data: {
      hasClaimedRewards: true,
    },
    refetch: fetchStatus,
    loading: false,
  };
}
