// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContainer, Logger } from './Container';
import React from 'react';
import { ContractSDK } from '@subql/contract-sdk';

// TODO remove once https://github.com/subquery/contracts/pull/13 released
export type SubqueryNetwork = 'mainnet' | 'testnet' | 'local';
type InitialState = {
  network?: SubqueryNetwork;
  endpoint?: string;
};

function useContractsImpl(logger: Logger, initialState?: InitialState): ContractSDK | undefined {
  // const contracts = React.useRef<ContractSDK | undefined>(undefined);
  const [contracts, setContracts] = React.useState<ContractSDK>();

  const initSdk = React.useCallback(async () => {
    if (!initialState || !initialState.network || !initialState.endpoint) {
      // contracts.current = undefined;
      setContracts(undefined);
      throw new Error('Invalid initial state, contracts provider requires network and endpoint');
    }

    try {
      const instance = await ContractSDK.create(initialState.network, initialState.endpoint);

      logger.l('Created ContractSDK instance');

      // contracts.current = instance;
      setContracts(instance);
    } catch (e) {
      logger.e('Failed to create ContractSDK instance', e);
      // contracts.current = undefined;
      setContracts(undefined);
      throw e;
    }
  }, [logger, initialState]);

  React.useEffect(() => {
    initSdk();
  }, [initSdk]);

  // return contracts.current;
  return contracts;
}

export const { useContainer: useContracts, Provider: ContractsProvider } = createContainer(useContractsImpl, {
  displayName: 'Contracts',
});
