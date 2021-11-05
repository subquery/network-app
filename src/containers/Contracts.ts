// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContainer, Logger } from './Container';
import React from 'react';
import { ContractSDK } from '@subql/contract-sdk';
import { useWeb3 } from './Web3';
import deploymentDetails from '../local.json';

function useContractsImpl(logger: Logger): ContractSDK | undefined {
  const [contracts, setContracts] = React.useState<ContractSDK>();
  const web3 = useWeb3();

  const signerOrProvider = React.useMemo(() => {
    return web3.account ? web3.library?.getSigner(web3.account) : web3.library;
  }, [web3]);

  const initSdk = React.useCallback(async () => {
    if (!signerOrProvider) {
      setContracts(undefined);
      return;
    }

    try {
      const instance = await ContractSDK.create(signerOrProvider, { deploymentDetails });

      logger.l('Created ContractSDK instance');

      setContracts(instance);
    } catch (e) {
      logger.e('Failed to create ContractSDK instance', e);
      setContracts(undefined);
      throw e;
    }
  }, [logger, signerOrProvider]);

  React.useEffect(() => {
    initSdk();
  }, [initSdk]);

  return contracts;
}

export const { useContainer: useContracts, Provider: ContractsProvider } = createContainer(useContractsImpl, {
  displayName: 'Contracts',
});
