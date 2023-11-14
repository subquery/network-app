// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { NETWORK_NAME } from '@containers/Web3';
import { ContractSDK } from '@subql/contract-sdk';
import { ContractClient } from '@subql/network-clients';
import { parseError } from '@utils';

import { useWeb3Store } from 'src/stores';

import { useEthersSigner } from './useEthersProvider';

export function useInitContracts(): { loading: boolean } {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { setContracts, setContractClient } = useWeb3Store();
  const { signer } = useEthersSigner();

  React.useEffect(() => {
    function initContract() {
      if (signer) {
        try {
          const contractInstance = ContractSDK.create(signer, { network: NETWORK_NAME });
          setContracts(contractInstance);

          const sortedContractClient = ContractClient.create(contractInstance);
          setContractClient(sortedContractClient);

          console.log('Contract Instance Initial', contractInstance);
        } catch (error) {
          parseError(error);
        }
      }
    }
    setIsLoading(true);
    initContract();
    setIsLoading(false);
  }, [signer, setContractClient, setContracts]);

  return { loading: isLoading };
}
