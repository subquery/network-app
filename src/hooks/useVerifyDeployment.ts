// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { useIPFS } from '@containers';

export const useVerifyDeployment = () => {
  const ipfs = useIPFS();
  const getDployment = React.useCallback(
    async (deploymentId: string) => {
      const deployment = await ipfs.catSingle(deploymentId);
      const result = Buffer.from(deployment).toString('utf8');
      return result;
    },
    [ipfs],
  );

  const verifyIfSubQuery = React.useCallback(
    async (deploymentId: string) => {
      try {
        const deployment = await getDployment(deploymentId);
        return deployment.includes('@subql');
      } catch {
        return false;
      }
    },
    [getDployment],
  );

  const verifyIfSubGraph = React.useCallback(
    async (deploymentId: string) => {
      try {
        const deployment = await getDployment(deploymentId);
        return deployment.includes('wasm/assemblyscript');
      } catch {
        return false;
      }
    },
    [getDployment],
  );

  return { verifyIfSubQuery, verifyIfSubGraph };
};
