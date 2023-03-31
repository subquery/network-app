// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { getIsOfflineDeploymentOnContract } from '@utils/getIndexerStatus';
import assert from 'assert';
import { useWeb3Store } from 'src/stores';
import { AsyncMemoReturn, useAsyncMemo } from './useAsyncMemo';

export function useDeploymentStatusOnContract(
  indexer: string,
  deploymentId: string | undefined,
): AsyncMemoReturn<boolean> {
  const { contracts } = useWeb3Store();
  return useAsyncMemo(async () => {
    assert(contracts, 'Contracts not available');

    return await getIsOfflineDeploymentOnContract(indexer, deploymentId, contracts);
  }, []);
}
