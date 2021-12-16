// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DependencyList, useEffect, useState } from 'react';
import { AsyncData } from '../utils';

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T | undefined = undefined,
): AsyncData<T> {
  const [result, setResult] = useState<AsyncData<T>>({ data: initial, loading: false });

  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null) return;
    setResult({ loading: true });

    promise.then(
      (data) => {
        if (!cancel) {
          setResult({ data, loading: false });
        }
      },
      (error) => {
        setResult({ error, loading: false });
      },
    );

    return () => {
      cancel = true;
      setResult((res) => ({ ...res, loading: false }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return result;
}
