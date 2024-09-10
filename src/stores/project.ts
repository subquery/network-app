// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { create } from 'zustand';

export type ProjectStore = {
  projectInfo: {
    [key: string]: {
      totalIndexers: number; // num of operators
    };
  };
  projectMaxTargetHeightInfoRef: Map<string, number>;
  projectMaxTargetHeightInfo: {
    [key: string]: number;
  };
  projectDbSize: {
    [key: string]: {
      max: number;
      average: number;
      counts: number; // num of operators
    };
  };
  setProjectMaxTargetHeightInfo: (id: string, value: number) => void;
  setProjectDbSize: (id: string, value: number) => void;
  setProjectInfo: (id: string, value: { totalIndexers: number }) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projectMaxTargetHeightInfoRef: new Map(),
  projectMaxTargetHeightInfo: {},
  projectDbSize: {},
  projectInfo: {},
  setProjectInfo: (id, value) =>
    set(({ projectInfo }) => {
      return {
        projectInfo: {
          ...projectInfo,
          [id]: value,
        },
      };
    }),
  setProjectDbSize(id, value) {
    set(({ projectDbSize }) => {
      let oldProject = projectDbSize[id];
      if (!oldProject) {
        oldProject = {
          max: value,
          average: value,
          counts: 1,
        };
      } else {
        oldProject.max = Math.max(oldProject.max, value);
        oldProject.average = Math.floor((oldProject.average * oldProject.counts + value) / (oldProject.counts + 1));
        oldProject.counts += 1;
      }

      return {
        projectDbSize: {
          ...projectDbSize,
          [id]: oldProject,
        },
      };
    });
  },
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
