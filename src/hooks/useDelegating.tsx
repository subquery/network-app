// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useGetDelegatorQuery } from '@subql/react-hooks';
import { BigNumber } from 'ethers';

import { parseRawEraValue } from './useEraValue';
import { useAsyncMemo, useEra } from '.';

export function useDelegating(address: string) {
  const { currentEra } = useEra();
  const ownDelegation = useGetDelegatorQuery({
    variables: {
      address: `${address}`,
    },
  });

  return useAsyncMemo(async () => {
    const eraIndex = currentEra.data?.index;
    const delgationAmount = ownDelegation.data?.delegator?.totalDelegations;
    const eraValue = parseRawEraValue(delgationAmount, eraIndex);
    return {
      curEra: eraValue.current,
      nextEra: eraValue.after || BigNumber.from(0),
    };
  }, [address, currentEra.data?.index, ownDelegation.data?.delegator?.totalDelegations]);
}
