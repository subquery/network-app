// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import { useAsyncMemo, useEraValue } from '.';
import { useContracts, useDelegation, useIndexer } from '../containers';
import { AsyncData } from '../utils';
import { CurrentEraValue } from './useEraValue';

export function useIndexerCapacity(address: string): AsyncData<CurrentEraValue<BigNumber> | undefined> {
  const pendingContracts = useContracts();
  const delegation = useDelegation(address, address);
  const indexerStake = useEraValue(delegation.data?.delegation?.amount);
  const indexer = useIndexer({ address: address });
  const indexerTotalStake = useEraValue(indexer?.data?.indexer?.totalStake);

  return useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    if (!contracts) return;

    const leverageLimit = await contracts.staking.indexerLeverageLimit();

    const current = indexerStake?.current.mul(leverageLimit).sub(indexerTotalStake?.current || 0) || BigNumber.from(0);
    const after =
      (indexerStake?.after && indexerStake?.after.mul(leverageLimit).sub(indexerTotalStake?.after || 0)) ||
      BigNumber.from(0);

    return { current, after };
  }, [indexerStake, pendingContracts]);
}
