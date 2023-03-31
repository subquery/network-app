// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3Store } from 'src/stores';
import { createContainer, Logger } from './Container';

function useIndexerRegistryImpl(logger: Logger): { getIndexer: (address: string) => Promise<string> } {
  const { contracts } = useWeb3Store();

  const getIndexer = async (address: string): Promise<string> => {
    if (!contracts) {
      throw new Error('QueryRegistry contract not available');
    }

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
