// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DeploymentStatus } from '@hooks';
import { ServiceStatus } from '@subql/network-query';

export function getDeploymentStatus(status: ServiceStatus | DeploymentStatus, isOfflineOnContract: boolean): string {
  if (status === DeploymentStatus.Unhealthy) {
    return DeploymentStatus.Unhealthy;
  }
  return isOfflineOnContract ? 'OFFLINE' : status;
}
