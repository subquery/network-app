// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import axios from 'axios';

import { wrapProxyEndpoint } from '.';

interface GetDeploymentProgress {
  proxyEndpoint?: string;
  deploymentId?: string;
  indexer: string;
}

type Metadata = {
  chain: string;
  genesisHash: string;
  indexerHealthy: boolean;
  indexerNodeVersion: string; // Semver
  lastProcessedHeight: number;
  lastProcessedTimestamp: string;
  queryNodeVersion: string; // Semver
  specName: string;
  targetHeight: number;
  startHeight?: number;
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
    return response?.data?.data?._metadata;
  } catch (err) {
    throw new Error(`Failed to fetch metadata from deployment's Query Service.`);
  }
}

export const deploymentProgessNumber = ({
  currentHeight,
  targetHeight,
  startHeight = 0,
}: {
  currentHeight: number;
  targetHeight: number;
  startHeight: number;
}) => {
  if (!(targetHeight - startHeight)) return 0;
  const result = Math.min(Math.max((currentHeight - startHeight) / (targetHeight - startHeight), 0), 1);
  return isNaN(result) ? 0 : result;
};

export const getDeploymentProgress = async ({
  proxyEndpoint,
  deploymentId,
  indexer,
}: GetDeploymentProgress): Promise<number> => {
  if (!proxyEndpoint || !deploymentId) {
    return 0;
  }

  const metadata = await getDeploymentMetadata({ proxyEndpoint, deploymentId, indexer });

  return deploymentProgessNumber({
    currentHeight: metadata?.lastProcessedHeight ?? 0,
    targetHeight: metadata?.targetHeight ?? 0,
    startHeight: metadata?.startHeight ?? 0,
  });
};
