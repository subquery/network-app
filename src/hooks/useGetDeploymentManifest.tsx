// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useIPFS } from '@containers';
import yaml from 'js-yaml';

export enum RPCFAMILY {
  EVM = 'evm',
  SUBSTRATE = 'substrate',
}

export type Manifest = {
  nodeType?: string;
  // subquery
  network?: {
    chainId: string;
  };
  // rpc
  rpcFamily?: (string | RPCFAMILY)[];
  client?: {
    name: string;
  };
  chain?: {
    chainId: string;
  };

  // subgraph
  dataSources?: {
    network: string;
  }[];
};

export const useGetDeploymentManifest = (currentDeploymentId?: string) => {
  const { catSingle } = useIPFS();

  const [manifest, setManifest] = useState<Manifest>();

  const getManifest = async (deploymentId: string) => {
    try {
      const res = await catSingle(deploymentId);

      const result = Buffer.from(res).toString('utf8');

      return yaml.load(result) as Manifest;
    } catch (e) {
      return {} as Manifest;
    }
  };

  useEffect(() => {
    const inner = async () => {
      if (currentDeploymentId) {
        const result = await getManifest(currentDeploymentId);
        setManifest(result);
      }
    };
    inner();
  }, [currentDeploymentId]);

  return {
    getManifest,
    manifest,
  };
};
