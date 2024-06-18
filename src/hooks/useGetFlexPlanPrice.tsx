// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { NETWORK_NAME } from '@containers/Web3';
import { Spinner, Typography } from '@subql/components';
import { STABLE_COIN_ADDRESSES, STABLE_COIN_SYMBOLS, TOKEN_SYMBOLS } from '@subql/network-config';
import { useStableCoin } from '@subql/react-hooks';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { BigNumber, BigNumberish, constants } from 'ethers';

import { useWeb3Store } from 'src/stores';

export function useGetFlexPlanPrice() {
  const { contracts } = useWeb3Store();
  const { transPrice, fetchedTime } = useStableCoin(contracts, NETWORK_NAME);

  const getFlexPlanPrice = (price: BigNumberish, fromAddress: string) => {
    if (!contracts?.sqToken.address) {
      return <Spinner></Spinner>;
    }

    const fromAdd = !fromAddress || fromAddress === constants.AddressZero ? contracts?.sqToken.address : fromAddress;
    const { sqtPrice, usdcPrice } = transPrice(fromAdd, BigNumber.from(price).mul(1000).toString());

    if (toChecksumAddress(STABLE_COIN_ADDRESSES[NETWORK_NAME]) !== toChecksumAddress(fromAdd)) {
      return (
        <Typography variant="medium">
          {sqtPrice} {TOKEN_SYMBOLS[NETWORK_NAME]}/1000 requests
        </Typography>
      );
    }

    return (
      <div>
        <Typography variant="medium">
          {usdcPrice} {STABLE_COIN_SYMBOLS[NETWORK_NAME]}/1000 requests
        </Typography>
        <br></br>
        <Typography variant="medium" type="secondary">
          = {sqtPrice} {TOKEN_SYMBOLS[NETWORK_NAME]} | {fetchedTime?.format('HH:mm:ss A')}
        </Typography>
      </div>
    );
  };

  return {
    getFlexPlanPrice,
  };
}
