// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, BigNumberish, utils } from 'ethers';

export function convertStringToNumber(value: string): number {
  return parseFloat(value);
}

export function truncateToDecimalPlace(value: number, decimalPlaces: number): number {
  return Math.trunc(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
}

export function convertBigNumberToNumber(value: BigNumberish | bigint): number {
  return BigNumber.from(value).toNumber();
}

export function truncFormatEtherStr(value: string, decimalPlaces = 4): string {
  const [wholeNumberStr, decimalPlacesStr] = value.split('.');
  if (!decimalPlacesStr) return wholeNumberStr;

  const subStrLength = decimalPlacesStr.length > decimalPlaces ? decimalPlaces : decimalPlacesStr.length;
  const sortedDecimalPlaceStr = decimalPlacesStr.substring(0, subStrLength);
  return wholeNumberStr.concat('.', sortedDecimalPlaceStr);
}

export function formatEther(value: BigNumberish | bigint | undefined, toFixed?: number): string {
  const formattedEther = utils.formatEther(BigNumber.from(value ?? 0).toString());
  return toFixed ? truncFormatEtherStr(formattedEther, toFixed) : formattedEther;
}

export function divToPercentage(value: number, divUnit = 100, decimalPlaces = 2): string {
  return (value / divUnit).toFixed(decimalPlaces);
}

export function mulToPercentage(value: number | string, mulUnit = 100, decimalPlaces = 2): string {
  const sortedValue = typeof value === 'string' ? convertStringToNumber(value) : value;

  return `${(sortedValue * mulUnit).toFixed(decimalPlaces)} %`;
}

export function extractPercentage(value: string): number {
  return convertStringToNumber(value.replace('%', ''));
}
