// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3Store } from 'src/stores';
import { useWeb3 } from '@containers';
import { useCallback, useEffect, useState } from 'react';

export function useStudioEnabled() {
  const { contracts } = useWeb3Store();
  const { account } = useWeb3();

  const [studioEnabled, setStudioEnabled] = useState(false);

  const checkStudioEnabled = useCallback(async () => {
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
