// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { bnToDate } from '@utils';

import { useWeb3Store } from 'src/stores';

import { useAsyncMemo } from './useAsyncMemo';

type Era = {
  startTime: Date;
  estEndTime: Date;
  index: number;
  period: number;
};

export function canStartNewEra(era: Era): boolean {
  return era.startTime.getTime() + era.period * 1000 < new Date().getTime();
}

/**
 * There is a room to improve this hook.
 * Option 1: We can use a subscription to listen to the event
 * Option 2: We can use a setInterval but require <CurEra> to be updated
 *
 */
export function useEra(): {
  currentEra: {
    data?: Era | undefined;
    loading: boolean;
    error?: Error | undefined;
  };
} {
  const { contracts } = useWeb3Store();

  const { refetch, ...currentEra } = useAsyncMemo(async () => {
    if (!contracts) {
      console.error('contracts not available');
      return;
    }

    const { eraManager } = contracts;

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
  }, [contracts]);

  return {
    currentEra,
  };
}
