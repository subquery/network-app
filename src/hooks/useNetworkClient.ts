// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractClient } from '@subql/network-clients';
import { ContractSDK } from '@subql/contract-sdk';
import deploymentDetails from '@subql/contract-sdk/publish/testnet.json';
import * as React from 'react';
import { useWeb3 } from '../containers';

export async function useNetworkClient(): Promise<ContractClient | undefined> {
  const web3 = useWeb3();

  const signerOrProvider = React.useMemo(() => {
    return web3.account ? web3.library?.getSigner(web3.account) : web3.library;
  }, [web3]);

  if (!signerOrProvider) {
    return undefined;
  }

  const pendingContract = await ContractSDK.create(signerOrProvider, { deploymentDetails });
  return ContractClient.create(pendingContract);
}
