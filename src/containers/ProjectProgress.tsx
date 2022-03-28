// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { createContainer } from './Container';

function useProjectProgressImpl() {
  const [startBlock, setStartBlock] = React.useState<number>(0);
  const [chainBlockHeight, setChainBlockHeight] = React.useState<number>(0);
  const [indexersStatus, setIndexerStatus] = React.useState<{ indexer: string; latestBlock: number }[]>([]);

  const updateIndexerStatus = React.useCallback((indexer: string, latestBlock: number, chainBlockHeight?: number) => {
    setIndexerStatus((current) => {
      const index = current.findIndex((v) => v.indexer === indexer);

      const copy = [...current];

      if (index < 0) {
        copy.push({ indexer, latestBlock });
      } else {
        copy[index] = { indexer, latestBlock };
      }

      return copy;
    });

    if (chainBlockHeight) {
      setChainBlockHeight((current) => Math.max(current, chainBlockHeight));
    }
  }, []);

  return {
    startBlock,
    setStartBlock,
    indexersStatus,
    updateIndexerStatus,
    chainBlockHeight,
  };
}

export const { useContainer: useProjectProgress, Provider: ProjectProgressProvider } = createContainer(
  useProjectProgressImpl,
  { displayName: 'ProjectProgress' },
);
