// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DependencyList, useEffect, useState, useCallback } from 'react';
import { AsyncData } from '../utils';

export interface AsyncMemoReturn<T> extends AsyncData<T> {
  refetch: (retainCurrent?: boolean) => void;
}

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T | undefined = undefined,
): AsyncMemoReturn<T> {
  const [result, setResult] = useState<AsyncData<T>>({ data: initial, loading: false });

  useEffect(() => {
    const promise = factory();
    if (promise === undefined || promise === null) return;

    let isSubscribed = true;
    setResult({ loading: true });

    promise
      .then((data) => isSubscribed && setResult({ data, loading: false }))
      .catch((error) => isSubscribed && setResult({ error, loading: false }));

    return () => {
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(
    async (retainCurrent?: boolean) => {
      const promise = factory();
      if (promise === undefined || promise === null) return;
      setResult((current) => ({ loading: true, data: retainCurrent ? current.data : undefined }));

      promise
        .then((data) => setResult({ data, loading: false }))
        .catch((error) => setResult({ error, loading: false }));
    },
    [factory],
  );

  return {
    ...result,
    refetch,
  };
}
