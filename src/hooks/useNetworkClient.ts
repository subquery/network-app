// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NetworkClient } from '@subql/network-clients';
import { ContractClient } from '@subql/network-clients/dist/clients/contractClient';
import { ContractSDK } from '@subql/contract-sdk';
import * as React from 'react';
import { useWeb3 } from '@containers';
import { NETWORK, networkDeploymentDetails } from '@utils';

export function useContractClient(): ContractClient | undefined {
  const [contractClient, setContractClient] = React.useState<ContractClient | undefined>();
  const web3 = useWeb3();

  const signerOrProvider = React.useMemo(() => {
    return web3.account ? web3.library?.getSigner(web3.account) : web3.library;
  }, [web3]);

  React.useEffect(() => {
    async function getContract() {
      if (signerOrProvider) {
        const pendingContract = await ContractSDK.create(signerOrProvider, {
          deploymentDetails: networkDeploymentDetails,
        });
        const sortedContractClient = ContractClient.create(pendingContract);
        setContractClient(sortedContractClient);
      }
    }

    getContract();
  }, [signerOrProvider]);

  return contractClient;
}

export function useNetworkClient(): NetworkClient | undefined {
  const [networkClient, setNetworkClient] = React.useState<NetworkClient | undefined>();

  React.useEffect(() => {
    async function getNetworkClient() {
      const client = await NetworkClient.create(NETWORK);
      setNetworkClient(client);
    }

    getNetworkClient();
  }, []);

  return networkClient;
}
