// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { POSClient, use } from '@maticnetwork/maticjs';
import { Web3ClientPlugin } from '@maticnetwork/maticjs-web3';
import { useAccount, useWalletClient } from 'wagmi';

// install web3 plugin
use(Web3ClientPlugin);

export const usePosClient = () => {
  const [posClient, setPosClient] = useState<POSClient>();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const initPos = async () => {
    if (!address || !walletClient) return;
    const client = new POSClient();
    await client.init({
      network: import.meta.env.VITE_NETWORK === 'testnet' ? 'testnet' : 'mainnet',
      version: import.meta.env.VITE_NETWORK === 'testnet' ? 'mumbai' : 'v1',
      parent: {
        provider: walletClient,
        defaultConfig: {
          from: address,
        },
      },
      child: {
        provider: walletClient,
        defaultConfig: {
          from: address,
        },
      },
    });

    setPosClient(client);
  };

  useEffect(() => {
    initPos();
  }, [walletClient, address]);

  return {
    posClient,
  };
};
