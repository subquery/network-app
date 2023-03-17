// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from './useAsyncMemo';
import { AsyncData } from '../utils';
import { useWeb3Store } from 'src/stores';

export function useENS(address: string): AsyncData<string | undefined | null> {
  const { ethProvider } = useWeb3Store();
  return useAsyncMemo(async () => {
    if (!address || !ethProvider) return undefined;

    const ens = await ethProvider.lookupAddress(address);
    return ens;
  }, [address]);
}
