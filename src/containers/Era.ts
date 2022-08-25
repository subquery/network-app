// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect } from 'react';
import { useAsyncMemo } from '../hooks';
import { bnToDate } from '../utils';
import { createContainer, Logger } from './Container';
import { useContracts } from './Contracts';

type Era = {
  startTime: Date;
  estEndTime: Date;
  index: number;
  period: number;
};

export function canStartNewEra(era: Era): boolean {
  return era.startTime.getTime() + era.period * 1000 < new Date().getTime();
}

function useEraImpl(logger: Logger) {
  const pendingContracts = useContracts();

  const { refetch, ...currentEra } = useAsyncMemo(async () => {
    if (!pendingContracts) {
      logger.w('contracts not available');
      return;
    }

    const { eraManager } = await pendingContracts;

    const [period, index, startTime] = await Promise.all([
      eraManager.eraPeriod(),
      eraManager.eraNumber(),
      eraManager.eraStartTime(),
    ]);

    const era: Era = {
      startTime: bnToDate(startTime),
      estEndTime: bnToDate(startTime.add(period)),
      period: period.toNumber(),
      index: index.toNumber(),
    };

    return era;
  }, [pendingContracts, logger]);

  const initEra = async () => {
    if (!pendingContracts) {
      logger.w('contracts not available');
      return;
    }

    const { eraManager } = await pendingContracts;

    const tx = await eraManager.startNewEra();

    await tx.wait();

    refetch();
  };

  const subNewEra = useCallback(async () => {
    const contracts = await pendingContracts;

    if (!contracts) return () => undefined;

    const filter = contracts.eraManager.filters.NewEraStart();

    const handler = () => refetch();

    contracts.eraManager.on(filter, handler);

    return () => {
      return contracts.eraManager.off(filter, handler);
    };
  }, [pendingContracts, refetch]);

  useEffect(() => {
    let unsub: () => void;

    subNewEra().then((_unsub) => {
      unsub = _unsub;
    });

    return () => {
      unsub?.();
    };
  }, [subNewEra]);

  return {
    initEra,
    currentEra,
  };
}

export const { useContainer: useEra, Provider: EraProvider } = createContainer<ReturnType<typeof useEraImpl>, never>(
  useEraImpl,
  { displayName: 'Era' },
);
