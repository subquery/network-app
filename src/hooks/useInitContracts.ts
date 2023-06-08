// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useWeb3 } from '@containers';
import { NETWORK_NAME } from '@containers/Web3';
import { ContractSDK } from '@subql/contract-sdk';
import { ContractClient } from '@subql/network-clients';

import { useWeb3Store } from 'src/stores';

export function useInitContracts(): { loading: boolean } {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { setContracts, setContractClient } = useWeb3Store();
  const { account, library } = useWeb3();

  React.useEffect(() => {
    function initContract() {
      const signerOrProvider = account ? library?.getSigner(account) : library;
      // NOTE: This is a check whether signer has issue with production only
      console.log('signerOrProvider', signerOrProvider);
      if (signerOrProvider) {
        try {
          const contractInstance = ContractSDK.create(signerOrProvider, { network: NETWORK_NAME });
          setContracts(contractInstance);

          const sortedContractClient = ContractClient.create(contractInstance);
          setContractClient(sortedContractClient);

          console.log('Contract Instance Initial', contractInstance);
        } catch (error) {
          console.error('Failed to init contracts', error);
        }
      }
    }
    setIsLoading(true);
    initContract();
    setIsLoading(false);
  }, [account, library, setContractClient, setContracts]);

  return { loading: isLoading };
}
