// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, utils } from 'ethers';

export function convertStringToNumber(value: string): number {
  return parseFloat(value);
}

export function convertBigNumberToNumber(value: BigInt | BigNumber | number | string): number {
  return BigNumber.from(value).toNumber();
}

export function formatEther(value: BigInt | BigNumber | number | string | undefined): string {
  return utils.formatEther(BigNumber.from(value ?? 0).toString());
}

export function toPercentage(value: number, divUnit = 100): string {
  return `${(value / divUnit).toFixed(2)} %`;
}
