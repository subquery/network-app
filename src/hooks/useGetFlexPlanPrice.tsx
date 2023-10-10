// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { NETWORK_NAME } from '@containers/Web3';
import { Typography } from '@subql/components';
import { STABLE_COIN_SYMBOLS, TOKEN_SYMBOLS } from '@subql/network-config';
import { useStableCoin } from '@subql/react-hooks';
import { toChecksumAddress } from 'ethereum-checksum-address';
import { BigNumber, BigNumberish } from 'ethers';

import { useWeb3Store } from 'src/stores';

export function useGetFlexPlanPrice() {
  const { contracts } = useWeb3Store();
  const { transPrice, fetchedTime } = useStableCoin(contracts, NETWORK_NAME);

  const getFlexPlanPrice = (price: BigNumberish, fromAddress: string) => {
    const { sqtPrice, usdcPrice } = transPrice(fromAddress, BigNumber.from(price).mul(1000).toString());

    if (toChecksumAddress(contracts?.sqToken.address || '') === toChecksumAddress(fromAddress)) {
      return (
        <Typography variant="medium">
          {sqtPrice} {TOKEN_SYMBOLS[NETWORK_NAME]}/1000 reqeusts
        </Typography>
      );
    }

    return (
      <Typography variant="medium">
        {usdcPrice} {STABLE_COIN_SYMBOLS[NETWORK_NAME]}/1000 reqeusts
        <br></br>
        <Typography variant="medium" type="secondary">
          = {sqtPrice} {TOKEN_SYMBOLS[NETWORK_NAME]} | {fetchedTime?.format('HH:mm:ss A')}
        </Typography>
      </Typography>
    );
  };

  return {
    getFlexPlanPrice,
  };
}
