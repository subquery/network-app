// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useMemo } from 'react';
import { makeCacheKey } from '@utils/limitation';
import { createWeb3Name } from '@web3-name-sdk/core';
import localforage from 'localforage';
import { once } from 'lodash-es';

type ReturnType = {
  expired: number;
  web3Name: string | null | undefined;
};

type Web3ReturnFuncType = (address?: string) => Promise<ReturnType | null | undefined>;

const rpcMainnet = [
  'https://eth.llamarpc.com',
  'https://ethereum.blockpi.network/v1/rpc/public',
  'https://rpc.payload.de',
  'https://ethereum.publicnode.com',
  'https://eth.merkle.io',
  'https://eth.drpc.org',
];

const rpcBNB = [
  'https://binance.llamarpc.com',
  'https://bsc.blockpi.network/v1/rpc/public',
  'https://bsc.publicnode.com',
  'https://bsc.drpc.org',
  'https://1rpc.io/bnb',
];

const rpcARB = [
  'https://arbitrum.llamarpc.com',
  'https://arbitrum.blockpi.network/v1/rpc/public',
  'https://arbitrum-one.publicnode.com',
  'https://arbitrum.drpc.org',
  'https://1rpc.io/arb',
];

export function useWeb3Name(address?: string): {
  fetchWeb3Name: Web3ReturnFuncType;
  fetchWeb3NameOnce: Web3ReturnFuncType;
  fetchWeb3NameFromCache: Web3ReturnFuncType;
} {
  const web3Name = useMemo(() => createWeb3Name(), []);

  const fetchWeb3Name = useCallback(
    async (customAddress?: string) => {
      if ((!address && !customAddress) || !web3Name) return undefined;
      const rpcMainnetRandom = rpcMainnet[Math.floor(Math.random() * rpcMainnet.length)];
      const rpcBNBRandom = rpcBNB[Math.floor(Math.random() * rpcBNB.length)];
      const rpcARBRandom = rpcARB[Math.floor(Math.random() * rpcARB.length)];

      let domainName = await web3Name.getDomainName({
        address: customAddress || address || '',
        queryTldList: ['eth'],
        rpcUrl: rpcMainnetRandom,
      });
      // If there is no eth domain name for that address check for bnb
      if (domainName === null) {
        domainName = await web3Name.getDomainName({
          address: customAddress || address || '',
          queryTldList: ['bnb'],
          rpcUrl: rpcBNBRandom,
        });
      }
      // if there is no bnb domain name for that address check for arb
      if (domainName === null) {
        domainName = await web3Name.getDomainName({
          address: customAddress || address || '',
          queryTldList: ['arb'],
          rpcUrl: rpcARBRandom,
        });
      }

      const res = {
        expired: domainName ? Date.now() + 1000 * 60 * 60 * 24 * 30 : Date.now() + 1000 * 60 * 60 * 24, // expect no expired if have web3Name.
        web3Name: domainName,
      };

      localforage.setItem(makeCacheKey(`web3name-${address}`), res);
      return res;
    },
    [web3Name],
  );

  const fetchWeb3NameFromCache = useCallback(async (customAddress?: string) => {
    if (!address && !customAddress) return;
    const ads = customAddress || address;
    return await localforage.getItem<ReturnType | null | undefined>(makeCacheKey(`web3name-${ads}`));
  }, []);

  return {
    fetchWeb3Name,
    fetchWeb3NameOnce: once(fetchWeb3Name),
    fetchWeb3NameFromCache,
  };
}
