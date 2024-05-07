// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWeb3Name } from '@web3-name-sdk/core';
import localforage from 'localforage';
import { once } from 'lodash-es';

type Web3ReturnFuncType = (address?: string) => Promise<string | null | undefined>;

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
  const web3Name = createWeb3Name();

  const rpcMainnetRandom = rpcMainnet[Math.floor(Math.random() * rpcMainnet.length)];

  const rpcBNBRandom = rpcBNB[Math.floor(Math.random() * rpcBNB.length)];

  const rpcARBRandom = rpcARB[Math.floor(Math.random() * rpcARB.length)];

  const fetchWeb3Name = async (customAddress?: string) => {
    if ((!address && !customAddress) || !web3Name) return undefined;
    let web3name = await web3Name.getDomainName({
      address: customAddress || address || '',
      queryTldList: ['eth'],
      rpcUrl: rpcMainnetRandom,
    });
    // If there is no eth domain name for that address check for bnb
    if (web3name === null) {
      web3name = await web3Name.getDomainName({
        address: customAddress || address || '',
        queryTldList: ['bnb'],
        rpcUrl: rpcBNBRandom,
      });
    }
    // if there is no bnb domain name for that address check for arb
    if (web3name === null) {
      web3name = await web3Name.getDomainName({
        address: customAddress || address || '',
        queryTldList: ['arb'],
        rpcUrl: rpcARBRandom,
      });
    }
    // if there is no arb domain name for that address then check for any other tld for that address
    if (web3name === null) {
      web3name = await web3Name.getDomainName({
        address: customAddress || address || '',
      });
    }
    localforage.setItem(`web3name-${address}`, web3name);
    return web3name;
  };

  const fetchWeb3NameFromCache = async (customAddress?: string) => {
    if (!address && !customAddress) return;
    const ads = customAddress || address;
    return await localforage.getItem<string | null | undefined>(`web3name-${ads}`);
  };

  return {
    fetchWeb3Name,
    fetchWeb3NameOnce: once(fetchWeb3Name),
    fetchWeb3NameFromCache,
  };
}
