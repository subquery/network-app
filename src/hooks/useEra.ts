// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import dayjs from 'dayjs';

import { useAsyncMemo } from './useAsyncMemo';

export type Era = {
  startTime: Date;
  estEndTime: Date;
  index: number;
  period: number;
  createdBlock: number;
  eras?: { id: string; createdBlock: number; startTime: Date; endTime?: Date }[];
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
  refetch: () => void;
} {
  const [fetchEraInfomation] = useLazyQuery<{
    eras: {
      nodes: { eraPeriod: string; startTime: Date; endTime: Date; id: string; createdBlock: number }[];
    };
  }>(gql`
    query {
      eras(orderBy: CREATED_BLOCK_DESC) {
        nodes {
          eraPeriod
          startTime
          endTime
          id
          createdBlock
        }
      }
    }
  `);

  const { refetch, data, loading, error } = useAsyncMemo(async () => {
    const res = await fetchEraInfomation();

    const lastestEra = res?.data?.eras?.nodes?.[0];

    if (lastestEra) {
      const { startTime, eraPeriod: period, id: index, createdBlock } = lastestEra;
      const eraIndex = new URL(window.location.href).searchParams.get('customEra') || index;

      return {
        startTime: dayjs.utc(startTime).local().toDate(),
        estEndTime: dayjs.utc(startTime).add(Number(period), 'millisecond').toDate(),
        period: Math.floor(Number(period) / 1000),
        index: parseInt(eraIndex),
        createdBlock: createdBlock,
        eras: res.data?.eras.nodes || [],
      };
    }

    return {
      startTime: new Date(),
      estEndTime: new Date(),
      period: 0,
      index: 0,
      createdBlock: 0,
      eras: [],
    };
  }, [fetchEraInfomation]);

  // use memo to avoid re-render
  // these are a historical reason, see the history of this file if want to know.
  const currentEra = useMemo(() => {
    return {
      data,
      loading,
      error,
    };
  }, [data?.estEndTime, data?.index, data?.period, data?.startTime, loading, error]);

  return {
    currentEra,
    refetch,
  };
}
