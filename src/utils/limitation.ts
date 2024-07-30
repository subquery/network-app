// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import plimit from 'p-limit';
import PQueue from 'p-queue';

import { sleep, waitForSomething } from './waitForSomething';

const limit = plimit(3);
export const limitQueue = new PQueue({
  concurrency: 2,
  interval: 1500,
});

// TODO: migrate to cache module
// supply more robust cache API.
// driver, expiration system...
export const makeCacheKey = (
  key: string,
  options: {
    prefix?: string;
    suffix?: string;
    type?: string; // maybe need to make a const varible. gerneral/sqt/flexplan such as.
  } = {},
) => {
  const { prefix = import.meta.env.MODE, type = 'gerneral', suffix = '' } = options;
  return `${prefix}-${type}-${key}-${suffix}`;
};

export const cachedResult: Map<string, any> = new Map();

export enum limitContractCacheEnum {
  CACHED_PENDING = 'cached-pending',
}

// limit 1 concurrency and will retry 4 times, interval 10s.

export const limitContract = async <T extends Promise<any>>(
  asyncFunc: () => T,
  cacheName?: string,
  cacheTime = 3000,
): Promise<T extends Promise<infer F> ? F : unknown> => {
  let error: any = null;
  if (cacheName) {
    if (cachedResult.has(cacheName)) {
      const curCachedResult = cachedResult.get(cacheName);
      if (curCachedResult === limitContractCacheEnum.CACHED_PENDING) {
        const getCache = await waitForSomething({
          func: () => cachedResult.get(cacheName) !== limitContractCacheEnum.CACHED_PENDING,
          timeout: 5 * 10000,
        });
        if (getCache) return cachedResult.get(cacheName);
      } else {
        return curCachedResult;
      }
    }

    cachedResult.set(cacheName, limitContractCacheEnum.CACHED_PENDING);
  }

  for (const _ of [0, 0, 0, 0]) {
    try {
      const result = await limit(asyncFunc);
      if (cacheName) {
        cachedResult.set(cacheName, result);
        if (cacheTime) {
          setTimeout(() => {
            cachedResult.delete(cacheName);
          }, cacheTime);
        }
      }
      return result;
    } catch (e) {
      error = e;
    }

    await sleep(10000);
  }

  if (cacheName && cacheTime) {
    cachedResult.delete(cacheName);
  }
  throw new Error(error);
};
