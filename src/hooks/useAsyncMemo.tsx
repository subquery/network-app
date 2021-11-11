// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DependencyList, useEffect, useState } from 'react';

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T | undefined = undefined,
): { data: T | undefined; loading: boolean; error?: Error } {
  const [data, setData] = useState<T | undefined>(initial);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null) return;
    setLoading(true);

    promise.then(
      (val) => {
        if (!cancel) {
          setData(val);
          setLoading(false);
        }
      },
      (error) => {
        setError(error);
        setLoading(false);
      },
    );

    return () => {
      cancel = true;
      setLoading(false);
    };
  }, deps);

  return {
    data,
    loading,
    error,
  };
}
