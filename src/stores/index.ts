// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

import { CommonSlice, commonSlice, EraSlice } from './common';

const useBoundStore = create<CommonSlice>((...a) => ({
  ...commonSlice(...a),
}));

export const useCurEra = (): number => useBoundStore((state) => state.curEra);
export const useEra = (): EraSlice => useBoundStore((state) => state, shallow);

export * from './web3Account';
