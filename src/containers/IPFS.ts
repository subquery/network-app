// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { makeCacheKey } from '@utils/limitation';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import localforage from 'localforage';
import LRUCache from 'lru-cache';

import { concatU8A } from '../utils';
import { createContainer, Logger } from './Container';

type InitialState = {
  gateway?: string;
};

function useIPFSImpl(
  logger: Logger,
  initialState?: InitialState,
): { ipfs: IPFSHTTPClient; catSingle: (cid: string) => Promise<Uint8Array> } {
  const { gateway } = initialState ?? {};

  if (!gateway) {
    throw new Error('No IPFS gateway provided');
  }
  const ipfs = React.useRef<IPFSHTTPClient>(create({ url: gateway }));
  const cache = React.useRef<LRUCache<string, Uint8Array>>(new LRUCache(150));

  React.useEffect(() => {
    ipfs.current = create({ url: gateway });
  }, [gateway, logger]);

  const catSingle = async (cid: string): Promise<Uint8Array> => {
    const cacheKey = makeCacheKey(cid, { type: 'IPFS' });
    const result = cache.current.get(cacheKey);
    if (result) {
      return result;
    }

    const cachedRes = await localforage.getItem<Uint8Array>(cacheKey);

    if (cachedRes) {
      cache.current.set(cacheKey, cachedRes);
      return cachedRes;
    }

    const results = ipfs.current.cat(cid, {
      length: 1024 * 1024 * 2, // 2MB
    });

    let res: Uint8Array | undefined = undefined;

    for await (const result of results) {
      logger.l(`Getting: ${cid}...DONE`);
      if (!res) {
        res = result;
      } else {
        res = concatU8A(res, result);
      }
    }

    if (res) {
      cache.current.set(cacheKey, res);
      localforage.setItem(cacheKey, res);
      return res;
    }

    throw new Error(`No content`);
  };

  return {
    ipfs: ipfs.current,
    catSingle,
  };
}

export const { useContainer: useIPFS, Provider: IPFSProvider } = createContainer(useIPFSImpl, { displayName: 'IPFS' });

export const decodeIpfsRaw = <T>(raw: Uint8Array): T => {
  return JSON.parse(Buffer.from(raw).toString('utf8'));
};
