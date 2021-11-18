// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from 'ethers';
import { useAsyncMemo } from '../hooks';
import { createContainer, Logger } from './Container';
import { useQueryRegistry } from './QueryRegistry';
import { useWeb3 } from './Web3';

function useUserProjectsImpl(logger: Logger) {
  const { account } = useWeb3();
  const { getUserQueries } = useQueryRegistry();

  return useAsyncMemo<BigNumber[]>(async () => {
    if (!account) return [];

    return getUserQueries(account);
  }, [account, getUserQueries]);

  // TODO update list when user creates a new project
}

export const { useContainer: useUserProjects, Provider: UserProjectsProvider } = createContainer(useUserProjectsImpl, {
  displayName: 'UserProjects',
});
