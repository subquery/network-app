// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DependencyList, useEffect, useState } from 'react';

export function useAsyncMemo<T>(
  factory: () => Promise<T> | undefined | null,
  deps: DependencyList,
  initial: T | undefined = undefined,
): T | undefined {
  const [val, setVal] = useState<T | undefined>(initial);

  useEffect(() => {
    let cancel = false;
    const promise = factory();
    if (promise === undefined || promise === null) return;

    promise.then((val) => {
      if (!cancel) {
        setVal(val);
      }
    });

    return () => {
      cancel = true;
    };
  }, deps);
  return val;
}
