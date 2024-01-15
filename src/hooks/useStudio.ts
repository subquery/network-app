// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { useWeb3Store } from 'src/stores';

export function useStudioEnabled() {
  const { contracts } = useWeb3Store();
  const { address: account } = useAccount();
  const [studioEnabled, setStudioEnabled] = useState(false);

  const checkStudioEnabled = useCallback(async () => {
    if (!contracts || !account) return;
    try {
      const studioEnabled = await contracts.queryRegistry.creatorWhitelist(account);
      setStudioEnabled(studioEnabled);
    } catch (e) {
      // don't care this error
    }
  }, [contracts, account]);

  useEffect(() => {
    checkStudioEnabled();
  }, [checkStudioEnabled]);

  return studioEnabled;
}
