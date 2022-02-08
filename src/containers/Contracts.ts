// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContainer, Logger } from './Container';
import React from 'react';
import { ContractSDK } from '@subql/contract-sdk';
import { useWeb3 } from './Web3';
import deploymentDetails from '../testnet.json';

function useContractsImpl(logger: Logger): Promise<ContractSDK> | undefined {
  const [contracts, setContracts] = React.useState<Promise<ContractSDK>>();
  const web3 = useWeb3();

  const signerOrProvider = React.useMemo(() => {
    return web3.account ? web3.library?.getSigner(web3.account) : web3.library;
  }, [web3]);

  const initSdk = React.useCallback(async () => {
    if (!signerOrProvider) {
      setContracts(undefined);
      return;
    }

    const pendingContracts = ContractSDK.create(signerOrProvider, { deploymentDetails });

    setContracts(pendingContracts);

    pendingContracts.then(
      () => logger.l('Contracts init'),
      (err) => logger.e('Failed to init contracts', err),
    );
  }, [logger, signerOrProvider]);

  React.useEffect(() => {
    initSdk();
  }, [initSdk]);

  return contracts;
}

export const { useContainer: useContracts, Provider: ContractsProvider } = createContainer(useContractsImpl, {
  displayName: 'Contracts',
});
