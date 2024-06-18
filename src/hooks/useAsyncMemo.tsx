// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';

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
  }, [...deps]);

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

export function useAsyncMemoWithLazy<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T | undefined = undefined,
): {
  result: Omit<AsyncMemoReturn<T>, 'refetch'>;
  refetch: () => Promise<
    | {
        data: Awaited<T>;
      }
    | undefined
  >;
} {
  const installed = useRef(false);
  const [result, setResult] = useState<AsyncData<T>>({ data: initial, loading: false });
  const [isLazyLoad, setIsLazyLoad] = useState(true);

  const proxyResult = useMemo(() => {
    return new Proxy(result, {
      get(target, p, receiver) {
        if (!installed.current && p !== 'loading') {
          installed.current = true;
          // setState when components rendering is not abled. So callback it in next cycle.
          const requestIdle = window.requestIdleCallback || setTimeout;
          requestIdle(() => setIsLazyLoad(false));
        }
        return Reflect.get(target, p, receiver);
      },
    });
  }, [result]);

  useEffect(() => {
    if (isLazyLoad) return;
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
  }, [isLazyLoad, ...deps]);

  const refetch = useCallback(
    async (retainCurrent?: boolean) => {
      const promise = factory();
      if (promise === undefined || promise === null) return;
      setResult((current) => ({ loading: true, data: retainCurrent ? current.data : undefined }));
      try {
        const res = await promise;
        setResult({ data: res, loading: false });
        return { data: res };
      } catch (e: any) {
        setResult({ error: e, loading: false });
      }
    },
    [factory],
  );

  return {
    result: proxyResult,
    refetch,
  };
}
