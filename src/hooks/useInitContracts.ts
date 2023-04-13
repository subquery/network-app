// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useWeb3Store } from 'src/stores';
import { ContractSDK } from '@subql/contract-sdk';
import { networkDeploymentDetails } from '@utils';
import { ContractClient } from '@subql/network-clients';
import { useWeb3 } from '@containers';

export function useInitContracts(): { loading: boolean } {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { contracts, setContracts, setContractClient } = useWeb3Store();
  const web3 = useWeb3();

  React.useEffect(() => {
    async function initContract() {
      const signerOrProvider = web3?.account ? web3?.library?.getSigner(web3.account) : web3?.library;
      // NOTE: This is a check whether signer has issue with production only
      console.log('signerOrProvider', signerOrProvider);
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
    setIsLoading(true);
    initContract();
    setIsLoading(false);
  }, [contracts, setContractClient, setContracts, web3]);

  return { loading: isLoading };
}
