// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, utils } from 'ethers';

export function convertStringToNumber(value: string): number {
  return parseFloat(value);
}

export function convertBigNumberToNumber(value: BigNumber | number): number {
  return BigNumber.from(value).toNumber();
}

export function formatEther(value: BigNumber | number | string | undefined): string {
  return utils.formatEther(BigNumber.from(value ?? 0).toString());
}

export function toPercentage(value: number): string {
  return `${(value / 100).toFixed(2)} %`;
}
