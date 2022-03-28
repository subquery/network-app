// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface GetDeploymentProgress {
  proxyEndpoint?: string;
  deploymentId?: string;
}

export const getDeploymentProgress = async ({
  proxyEndpoint,
  deploymentId,
}: GetDeploymentProgress): Promise<number> => {
  let progress = 0;

  if (!proxyEndpoint || !deploymentId) {
    return progress;
  }
  const url = `${proxyEndpoint}/metadata/${deploymentId}`;

  try {
    const response = await (await fetch(url)).json();
    const lastProcessedHeight = response.data._metadata.lastProcessedHeight ?? 0;
    const targetHeight = response.data._metadata.targetHeight ?? 0;
    progress = lastProcessedHeight / targetHeight;
  } catch (e) {
    console.error(e);
  }
  return progress;
};
