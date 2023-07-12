// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import plimit from 'p-limit';
import PQueue from 'p-queue';

import { sleep, waitForSomething } from './waitForSomething';

const limit = plimit(3);
export const limitQueue = new PQueue({
  concurrency: 12,
  interval: 1500,
});
const cachedResult: Record<string, any> = {};

export enum limitContractCacheEnum {
  CACHED_PENDING = 'cached-pending',
}

// limit 1 concurrency and will retry 4 times, interval 10s.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const limitContract = async <T extends Promise<any>>(
  asyncFunc: () => T,
  cacheName?: string,
): Promise<T extends Promise<infer F> ? F : unknown> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let error: any = null;
  if (cacheName) {
    if (cacheName in cachedResult) {
      const curCachedResult = cachedResult[cacheName];
      if (curCachedResult === limitContractCacheEnum.CACHED_PENDING) {
        const getCache = await waitForSomething({
          func: () => cachedResult[cacheName] !== limitContractCacheEnum.CACHED_PENDING,
          timeout: 5 * 10000,
        });
        if (getCache) return cachedResult[cacheName];
      } else {
        return curCachedResult;
      }
    }

    cachedResult[cacheName] = limitContractCacheEnum.CACHED_PENDING;
  }

  for (const _ of [0, 0, 0, 0]) {
    try {
      const result = await limit(asyncFunc);
      if (cacheName) {
        cachedResult[cacheName] = result;
        setTimeout(() => {
          delete cachedResult[cacheName];
        }, 15000);
      }
      return result;
    } catch (e) {
      error = e;
    }

    await sleep(10000);
  }

  if (cacheName) {
    delete cachedResult[cacheName];
  }
  throw new Error(error);
};
