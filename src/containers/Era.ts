// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback, useEffect, useState } from 'react';
import { bnToDate } from '../utils';
import { createContainer, Logger } from './Container';
import { useContracts } from './Contracts';

type Era = {
  startTime: Date;
  index: number;
  period: number;
};

export function canStartNewEra(era: Era): boolean {
  return era.startTime.getTime() + era.period * 1000 < new Date().getTime();
}

function useEraImpl(logger: Logger) {
  const pendingContracts = useContracts();

  const [currentEra, setCurrentEra] = useState<Era>();

  const getCurrentEra = useCallback(async () => {
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
      period: period.toNumber(),
      index: index.toNumber(),
    };

    setCurrentEra(era);

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

    getCurrentEra();
  };

  useEffect(() => {
    getCurrentEra();
  }, [getCurrentEra]);

  // TODO subscribe to new era events

  return {
    initEra,
    getCurrentEra,
    currentEra,
  };
}

export const { useContainer: useEra, Provider: EraProvider } = createContainer<ReturnType<typeof useEraImpl>, never>(
  useEraImpl,
  { displayName: 'Era' },
);
