// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

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

  const rawResponse = await fetch(endpoint);
  if (!rawResponse.ok) {
    throw new Error(`Failed to fetch deployment Metadata from endpoint.`);
  }

  const response = await rawResponse.json();
  return response?.data?._metadata;
}

export const getDeploymentProgress = async ({
  proxyEndpoint,
  deploymentId,
  indexer,
}: GetDeploymentProgress): Promise<number> => {
  if (!proxyEndpoint || !deploymentId) {
    return 0;
  }

 if (!proxyEndpoint || !deploymentId) {
    return 0;
  }

  try {
    const metadata = await getDeploymentMetadata({ proxyEndpoint, deploymentId, indexer });
     return metadata ? metadata.lastProcessedHeight / metadata.targetHeight : 0;
  } catch (error) {
    console.error(error)
      return 0;
  }
  

  try {
    metadata = await getDeploymentMetadata({ proxyEndpoint, deploymentId, indexer });
  } catch (error) {
    metadata = undefined;
  }

  if (!metadata) return 0;

  return metadata.lastProcessedHeight / metadata.targetHeight;
};
