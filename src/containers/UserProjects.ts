// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from 'ethers';
import * as React from 'react';
import { useContracts } from '.';
import { useAsyncMemo } from '../hooks';
import { createContainer, Logger } from './Container';
import { useQueryRegistry } from './QueryRegistry';
import { useWeb3 } from './Web3';

function useUserProjectsImpl(logger: Logger) {
  const { account } = useWeb3();
  const pendingContracts = useContracts();
  const { getUserQueries } = useQueryRegistry();

  const [cacheBreak, setCacheBreak] = React.useState<number>(0);

  const sub = React.useCallback(async () => {
    if (!account || !pendingContracts) return () => undefined;

    const contracts = await pendingContracts;

    const filter = contracts?.queryRegistry.filters.CreateQuery(null, account);

    const listener = () => setCacheBreak((val) => val + 1);

    contracts?.queryRegistry.on(filter, listener);
    return () => contracts.queryRegistry.off(filter, listener);
  }, [account, pendingContracts]);

  React.useEffect(() => {
    const pendingUnsub = sub();

    return () => {
      pendingUnsub.then((unsub) => unsub());
    };
  }, [sub]);

  return useAsyncMemo<BigNumber[]>(async () => {
    if (!account) return [];

    return getUserQueries(account);
  }, [account, getUserQueries, cacheBreak]);
}

export const { useContainer: useUserProjects, Provider: UserProjectsProvider } = createContainer(useUserProjectsImpl, {
  displayName: 'UserProjects',
});
