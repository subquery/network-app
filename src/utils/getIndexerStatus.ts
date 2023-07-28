// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ContractSDK } from '@subql/contract-sdk';
// import { cidToBytes32 } from '@subql/network-clients';
import { Status } from '@subql/network-query';

export async function getIsOfflineDeploymentOnContract(
  indexer: string,
  deploymentId: string | undefined,
  contract: ContractSDK | undefined,
): Promise<boolean> {
  // const isOffline =
  //   deploymentId && contract ? await contract?.queryRegistry.isOffline(cidToBytes32(deploymentId), indexer) : false;
  // return isOffline;
  return false;
}

export function getDeploymentStatus(status: Status, isOfflineOnContract: boolean): string {
  return isOfflineOnContract ? 'OFFLINE' : status;
}
