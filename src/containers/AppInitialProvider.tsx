// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import { useWeb3Store } from 'src/stores';
import { useWeb3 } from './Web3';
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';
import { ContractSDK } from '@subql/contract-sdk';
import { networkDeploymentDetails } from '@utils';

/**
 *
 * This is the App Initial State
 * The App will initial ContractSDK, and store at global state
 */
export const AppInitProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { contract, setContract } = useWeb3Store();
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
      if (signerOrProvider && !contract) {
        try {
          const contractInstance = await ContractSDK.create(signerOrProvider, {
            deploymentDetails: networkDeploymentDetails,
          });
          setContract(contractInstance);
          console.log('Contract Instance Initial', contractInstance);
        } catch (error) {
          console.error('Failed to init contracts', error);
        }
      }
    }
    initContract();
  }, [contract, setContract, signerOrProvider]);

  return <div>{children}</div>;
};
