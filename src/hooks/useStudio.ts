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
    // @ts-ignore
    setStudioEnabled(true);
    return
    console.log('account:', account);
    if (!contracts || !account) return;
    const studioEnabled = await contracts.queryRegistry.creatorWhitelist(account);
    setStudioEnabled(studioEnabled);
  }, [contracts, account]);

  useEffect(() => {
    checkStudioEnabled();
  }, [checkStudioEnabled]);

  return studioEnabled;
}
