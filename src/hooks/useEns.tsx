// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import localforage from 'localforage';
import { once } from 'lodash-es';

import { useWeb3Store } from 'src/stores';

type EnsReturnFuncType = () => Promise<string | null | undefined>;
export function useENS(address: string): {
  fetchEnsName: EnsReturnFuncType;
  fetchEnsNameOnce: EnsReturnFuncType;
  fetchEnsFromCache: EnsReturnFuncType;
} {
  const { ethProvider } = useWeb3Store();

  const fetchEnsName = async () => {
    if (!address || !ethProvider) return undefined;
    const ens = await ethProvider().lookupAddress(address);
    localforage.setItem(`ens-${address}`, ens);
    return ens;
  };

  const fetchEnsFromCache = async () => {
    if (!address) return;
    return await localforage.getItem<string | null | undefined>(`ens-${address}`);
  };

  return {
    fetchEnsName,
    fetchEnsNameOnce: once(fetchEnsName),
    fetchEnsFromCache,
  };
}
