// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface GetDeploymentProgress {
  proxyEndpoint?: string;
  deploymentId?: string;
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
}

export async function getDeploymentMetadata({ deploymentId, proxyEndpoint}: GetDeploymentProgress): Promise<Metadata | undefined>{
  if (!proxyEndpoint || !deploymentId) {
    return undefined;
  }

  const url = new URL(proxyEndpoint);
  url.pathname = `/metadata/${deploymentId}`;
  const response = await (await fetch(url.toString())).json();

  return response.data._metadata;
}

export const getDeploymentProgress = async ({
  proxyEndpoint,
  deploymentId,
}: GetDeploymentProgress): Promise<number> => {
  if (!proxyEndpoint || !deploymentId) {
    return 0;
  }

  const metadata = await getDeploymentMetadata({ proxyEndpoint, deploymentId });

  if (!metadata) return 0;

  return metadata.lastProcessedHeight / metadata.targetHeight;
};
