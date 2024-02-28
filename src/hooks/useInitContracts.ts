// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { l1Chain, l2Chain, NETWORK_NAME } from '@containers/Web3';
import { RootContractSDK } from '@subql/contract-sdk/rootSdk';
import { ContractSDK } from '@subql/contract-sdk/sdk';
import { ContractClient } from '@subql/network-clients';
import { parseError } from '@utils';
import { base, baseSepolia, mainnet, sepolia } from 'viem/chains';

import { useWeb3Store } from 'src/stores';

import { useEthersProviderWithPublic, useEthersSigner } from './useEthersProvider';

export function useInitContracts(): { loading: boolean } {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { setContracts, setRootContracts, setContractClient } = useWeb3Store();
  const { signer } = useEthersSigner();
  const provider = useEthersProviderWithPublic();
  const ethereumProvider = useEthersProviderWithPublic({
    chainId: import.meta.env.MODE === 'testnet' ? sepolia.id : mainnet.id,
  });
  const baseProvider = useEthersProviderWithPublic({
    chainId: import.meta.env.MODE === 'testnet' ? baseSepolia.id : base.id,
  });

  React.useEffect(() => {
    function initContract() {
      if (signer || provider) {
        try {
          const contractInstance = ContractSDK.create(
            signer?.provider.network.chainId === l2Chain.id ? signer : baseProvider,
            { network: NETWORK_NAME },
          );

          setContracts(contractInstance);

          const sortedContractClient = ContractClient.create(contractInstance);
          setContractClient(sortedContractClient);

          console.log('Contract Instance Initial', contractInstance);
        } catch (error) {
          parseError(error);
        }
      }

      if (ethereumProvider) {
        const rootContractInstance = RootContractSDK.create(
          signer?.provider.network.chainId === l1Chain.id ? signer : ethereumProvider,
          { network: NETWORK_NAME },
        );
        setRootContracts(rootContractInstance);
      }
    }
    setIsLoading(true);
    initContract();
    setIsLoading(false);
  }, [signer, provider, setContractClient, setContracts]);

  return { loading: isLoading };
}
