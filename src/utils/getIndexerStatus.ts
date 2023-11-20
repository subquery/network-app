// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ServiceStatus } from '@subql/network-query';

export function getDeploymentStatus(status: ServiceStatus, isOfflineOnContract: boolean): string {
  return isOfflineOnContract ? 'OFFLINE' : status;
}
