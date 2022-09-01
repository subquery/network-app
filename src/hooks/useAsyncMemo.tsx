// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import { AsyncData, CancellablePromise } from '../utils';

export interface AsyncMemoReturn<T> extends AsyncData<T> {
  refetch: (retainCurrent?: boolean) => void;
}

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T | undefined = undefined,
): AsyncMemoReturn<T> {
  const [result, setResult] = useState<AsyncData<T>>({ data: initial, loading: false });

  const task = useRef<CancellablePromise<void>>();

  useEffect(() => {
    const promise = factory();
    if (promise === undefined || promise === null) return;
    setResult({ loading: true });
    task.current = new CancellablePromise(
      promise
        .then((data) => setResult({ data, loading: false }))
        .catch((error) => setResult({ error, loading: false })),
    );

    return () => {
      task.current?.cancel();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(
    async (retainCurrent?: boolean) => {
      const promise = factory();
      if (promise === undefined || promise === null) return;
      setResult((current) => ({ loading: true, data: retainCurrent ? current.data : undefined }));
      task.current = new CancellablePromise(
        promise
          .then((data) => setResult({ data, loading: false }))
          .catch((error) => setResult({ error, loading: false })),
      );
    },
    [factory],
  );

  return { ...result, refetch };
}
