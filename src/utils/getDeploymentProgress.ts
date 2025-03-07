// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { indexingProgress } from '@subql/network-clients';
import axios from 'axios';

import { wrapProxyEndpoint } from '.';

interface GetDeploymentProgress {
  proxyEndpoint?: string;
  deploymentId?: string;
  indexer: string;
}

export type Metadata = {
  chain: string;
  dbSize: number;
  genesisHash: string;
  indexerHealthy: boolean;
  indexerNodeVersion: string; // Semver
  lastHeight: number;
  lastProcessedTimestamp: string;
  queryNodeVersion: string; // Semver
  specName: string;
  targetHeight: number;
  startHeight?: number;
  poiHash: string;
};

export async function getDeploymentMetadata({
  deploymentId,
  proxyEndpoint,
  indexer,
}: GetDeploymentProgress): Promise<Metadata | undefined> {
  if (!proxyEndpoint || !deploymentId) {
    return undefined;
  }

  let url;
  try {
    url = new URL(proxyEndpoint);
  } catch (error) {
    throw new Error('proxyEndpoint is invalid.');
  }

  url.pathname = `/metadata/${deploymentId}`;

  const endpoint = wrapProxyEndpoint(url.toString(), indexer);

  if (!endpoint) throw new Error('Endpoint not available.');

  try {
    const response = await axios.get(endpoint, {
      timeout: 5000, // 5 seconds
    });
    return response?.data;
  } catch (err) {
    throw new Error(`Failed to fetch metadata from deployment's Query Service.`);
  }
}

export const getDeploymentProgress = async ({
  proxyEndpoint,
  deploymentId,
  indexer,
}: GetDeploymentProgress): Promise<number> => {
  if (!proxyEndpoint || !deploymentId) {
    return 0;
  }

  const metadata = await getDeploymentMetadata({ proxyEndpoint, deploymentId, indexer });

  return indexingProgress({
    currentHeight: metadata?.lastHeight ?? 0,
    targetHeight: metadata?.targetHeight ?? 0,
    startHeight: metadata?.startHeight ?? 0,
  });
};
