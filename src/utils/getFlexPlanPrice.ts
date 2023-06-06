// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumberish } from 'ethers';

import { convertStringToNumber, formatEther } from './numberFormatters';

export function getFlexPlanPrice(price: BigNumberish): string {
  const amount = 1000;
  const sortedPrice = `${convertStringToNumber(formatEther(price, 4)) * amount}`;
  const sortedRequest = `${amount} requests`;
  return `${sortedPrice} / ${sortedRequest}`;
}
