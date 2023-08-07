// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ESMap } from 'typescript';
import { create } from 'zustand';

export type ProjectStore = {
  projectMaxTargetHeightInfoRef: ESMap<string, number>;
  projectMaxTargetHeightInfo: {
    [key: string]: number;
  };
  setProjectMaxTargetHeightInfo: (id: string, value: number) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projectMaxTargetHeightInfoRef: new Map(),
  projectMaxTargetHeightInfo: {},
  setProjectMaxTargetHeightInfo: (id, val) =>
    set(({ projectMaxTargetHeightInfo, projectMaxTargetHeightInfoRef }) => {
      const oldProj = { ...projectMaxTargetHeightInfo };
      oldProj[id] = val;
      projectMaxTargetHeightInfoRef.set(id, val);

      return {
        projectMaxTargetHeightInfo: oldProj,
      };
    }),
}));
