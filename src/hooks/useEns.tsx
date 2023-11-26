// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createWeb3Name } from '@web3-name-sdk/core';
import localforage from 'localforage';
import { once } from 'lodash-es';

type EnsReturnFuncType = () => Promise<string | null | undefined>;
export function useENS(address: string): {
  fetchEnsName: EnsReturnFuncType;
  fetchEnsNameOnce: EnsReturnFuncType;
  fetchEnsFromCache: EnsReturnFuncType;
} {
  const web3Name = createWeb3Name();

  const fetchEnsName = async () => {
    if (!address || !web3Name) return undefined;

    let ens = await web3Name.getDomainName({
      address,
      queryTldList: ['ens'],
    });

    // If there is no domain for ENS
    if (ens === null) {
      ens = await web3Name.getDomainName({ address });
    }
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
