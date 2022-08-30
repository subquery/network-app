// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, utils, BigNumberish } from 'ethers';

export function convertStringToNumber(value: string): number {
  return parseFloat(value);
}

export function convertBigNumberToNumber(value: BigNumberish | BigInt): number {
  return BigNumber.from(value).toNumber();
}

export function formatEther(value: BigNumberish | BigInt | undefined, toFixed?: number): string {
  const formattedEther = utils.formatEther(BigNumber.from(value ?? 0).toString());
  return toFixed ? convertStringToNumber(formattedEther).toFixed(toFixed) : formattedEther;
}

// TODO: should only be number and percentage formatter
export function toPercentage(value: number, divUnit = 100): string {
  return `${(value / divUnit).toFixed(2)} %`;
}

export function extractPercentage(value: string): number {
  return convertStringToNumber(value.replace('%', ''));
}
