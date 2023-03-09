// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContainer, Logger } from './Container';
import { useContracts } from './Contracts';

function useIndexerRegistryImpl(logger: Logger): { getIndexer: (address: string) => Promise<string> } {
  const pendingContracts = useContracts();

  const getIndexer = async (address: string): Promise<string> => {
    if (!pendingContracts) {
      throw new Error('QueryRegistry contract not available');
    }

    const contracts = await pendingContracts;

    return await contracts.indexerRegistry.metadata(address);
  };

  return {
    getIndexer,
  };
}

export const { useContainer: useIndexerRegistry, Provider: IndexerRegistryProvider } = createContainer(
  useIndexerRegistryImpl,
  { displayName: 'IndexerRegistry ' },
);
