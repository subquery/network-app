// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { NETWORK_NAME } from '@containers/Web3';
import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { ContractSDK } from '@subql/contract-sdk/sdk';
import { SQToken__factory } from '@subql/contract-sdk/typechain/factories/contracts/root/SQToken__factory';
import { ContractClient } from '@subql/network-clients';
import { parseError } from '@utils';
import { goerli, mainnet } from 'viem/chains';

import { useWeb3Store } from 'src/stores';

import { useEthersProviderWithPublic, useEthersSigner } from './useEthersProvider';

export function useInitContracts(): { loading: boolean } {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { setContracts, setRootContracts, setContractClient } = useWeb3Store();
  const { signer } = useEthersSigner();
  const provider = useEthersProviderWithPublic();
  const ethereumProvider = useEthersProviderWithPublic({
    chainId: import.meta.env.MODE === 'testnet' ? goerli.id : mainnet.id,
  });

  React.useEffect(() => {
    function initContract() {
      if (signer || provider) {
        try {
          const contractInstance = ContractSDK.create(signer || provider, { network: NETWORK_NAME });
          setContracts(contractInstance);

          const sortedContractClient = ContractClient.create(contractInstance);
          setContractClient(sortedContractClient);

          console.log('Contract Instance Initial', contractInstance);
        } catch (error) {
          parseError(error);
        }
      }

      if (ethereumProvider) {
        const sqTokenContract = SQToken__factory.connect(
          import.meta.env.MODE === 'testnet' ? testnetJSON.root.SQToken.address : mainnetJSON.root.SQToken.address,
          ethereumProvider,
        );
        const rootContractInstance = {
          sqToken: sqTokenContract,
        };
        setRootContracts(rootContractInstance);
      }
    }
    setIsLoading(true);
    initContract();
    setIsLoading(false);
  }, [signer, provider, setContractClient, setContracts]);

  return { loading: isLoading };
}
