// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useWeb3Store } from 'src/stores';

import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ContractSDK } from '@subql/contract-sdk';
import { networkDeploymentDetails } from '@utils';
import { ContractClient } from '@subql/network-clients';
import { useWeb3 } from '@containers';

export function useInitContracts(): { loading: boolean } {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { contracts, setContracts, setContractClient } = useWeb3Store();
  const web3 = useWeb3();
  const [signerOrProvider, setSignerOrProvider] = React.useState<Web3Provider | JsonRpcSigner | undefined>();

  React.useEffect(() => {
    if (web3) {
      const signerOrProvider = web3.account ? web3.library?.getSigner(web3.account) : web3.library;
      setSignerOrProvider(signerOrProvider);
    }
  }, [web3]);

  React.useEffect(() => {
    async function initContract() {
      setIsLoading(true);
      if (signerOrProvider && !contracts) {
        try {
          const contractInstance = await ContractSDK.create(signerOrProvider, {
            deploymentDetails: networkDeploymentDetails,
          });
          setContracts(contractInstance);

          const sortedContractClient = ContractClient.create(contractInstance);
          setContractClient(sortedContractClient);

          console.log('Contract Instance Initial', contractInstance);
        } catch (error) {
          console.error('Failed to init contracts', error);
        }
      }
    }
    initContract();
    setIsLoading(false);
  }, [contracts, setContractClient, setContracts, signerOrProvider]);

  return { loading: isLoading };
}
