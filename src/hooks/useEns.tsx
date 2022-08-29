// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useAsyncMemo } from './useAsyncMemo';
import { AsyncData, fetchEns } from '../utils';

export function useENS(address: string): AsyncData<string | undefined> {
  return useAsyncMemo(async () => {
    if (!address) return undefined;

    const ens = await fetchEns(address);
    return ens;
  }, [address]);
}
