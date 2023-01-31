// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createContainer, Logger } from './Container';
import React from 'react';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import LRUCache from 'lru-cache';
import { concatU8A } from '../utils';

// TODO: similar with contract sdk, can maintain the ipfs instance in state
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
  const cache = React.useRef<LRUCache<string, Uint8Array>>(new LRUCache(50));

  React.useEffect(() => {
    // logger.l(`Creating ipfs client at: ${gateway}`);
    ipfs.current = create({ url: gateway });
  }, [gateway, logger]);

  const catSingle = async (cid: string): Promise<Uint8Array> => {
    // logger.l(`Getting: ${cid}`);

    const result = cache.current.get(cid);
    if (result) {
      // logger.l(`Getting: ${cid}...CACHED`);
      return result;
    }

    const results = ipfs.current.cat(cid);

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
      cache.current.set(cid, res);
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
