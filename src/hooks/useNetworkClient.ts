// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractClient, NetworkClient } from '@subql/network-clients';
import { ContractSDK } from '@subql/contract-sdk';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import * as React from 'react';
import { useWeb3 } from '../containers';
import { networkDeploymentDetails } from '../utils';

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
  const web3 = useWeb3();

  const signerOrProvider = React.useMemo(() => {
    return web3.account ? web3.library?.getSigner(web3.account) : web3.library;
  }, [web3]);

  const ipfs: IPFSHTTPClient = create({ url: process.env.REACT_APP_IPFS_GATEWAY });

  React.useEffect(() => {
    async function getNetworkClient() {
      if (signerOrProvider && ipfs) {
        const pendingContract = await ContractSDK.create(signerOrProvider, {
          deploymentDetails: networkDeploymentDetails,
        });
        const sortedNetworkClient = NetworkClient.create(pendingContract, ipfs);
        setNetworkClient(sortedNetworkClient);
      }
    }

    getNetworkClient();
  }, [ipfs, signerOrProvider]);

  return networkClient;
}
