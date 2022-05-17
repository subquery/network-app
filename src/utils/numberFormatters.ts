// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, utils, BigNumberish } from 'ethers';

export function convertStringToNumber(value: string): number {
  return parseFloat(value);
}

export function convertBigNumberToNumber(value: BigNumberish | BigInt): number {
  return BigNumber.from(value).toNumber();
}

export function formatEther(value: BigNumberish | BigInt | undefined): string {
  return utils.formatEther(BigNumber.from(value ?? 0).toString());
}

export function toPercentage(value: number, divUnit = 100): string {
  return `${(value / divUnit).toFixed(2)} %`;
}

export function extractPercentage(value: string): number {
  return convertStringToNumber(value.replace('%', ''));
}
