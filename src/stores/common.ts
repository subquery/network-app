// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { StateCreator } from 'zustand';

/**
 *
 * NOTE:
 * Common stores such as era, contract instance, etc.
 *
 */

interface Era {
  curEra: number;
  startTime?: Date;
  estEndTime?: Date;
  period?: number;
}

export interface EraSlice extends Era {
  actions: {
    setCurEra: (era: number) => void;
    setEra: (era: Era) => void;
  };
}

export const eraSlice: StateCreator<EraSlice, [], [], EraSlice> = (set) => ({
  curEra: 0,
  actions: {
    setCurEra: (era: number) => set((state) => ({ curEra: era })),
    setEra: (era: Era) => set((state) => ({ ...state, ...era })),
  },
});

export type CommonSlice = EraSlice;

export const commonSlice: StateCreator<CommonSlice, [], [], CommonSlice> = eraSlice;
