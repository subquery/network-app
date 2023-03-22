// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { UseSortedIndexerDeploymentsReturn } from '@hooks';

export function getDeployStatus(statu: string, deployment: UseSortedIndexerDeploymentsReturn): string {
  let sortedStatus = statu;
  if (deployment?.isOffline) {
    sortedStatus = 'OFFLINE' as string;
  }
  return sortedStatus;
}
