// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useWeb3Store } from 'src/stores';

import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export function useENS(address: string): AsyncData<string | undefined | null> {
  const { ethProvider } = useWeb3Store();
  return useAsyncMemo(async () => {
    if (!address || !ethProvider) return undefined;

    const ens = await ethProvider.lookupAddress(address);
    return ens;
  }, [address]);
}
