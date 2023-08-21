// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

// TODO: migrate all those to client-sdk.
import { SQT_TOKEN_ADDRESS } from '@containers/Web3';
import BigNumberJs from 'bignumber.js';
import { BigNumber, BigNumberish, utils } from 'ethers';

import { tokenDecimals } from './constants';

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

export const toPercentage = (val: number, total: number, bigNumber = false) => {
  if (total === 0) return `100 %`;
  return ((val / total) * 100).toFixed(2) + '%';
};

export const formatSQT = (val: string) => {
  return BigNumberJs(val)
    .div(10 ** tokenDecimals[SQT_TOKEN_ADDRESS])
    .toNumber();
};

export function extractPercentage(value: string): number {
  return convertStringToNumber(value.replace('%', ''));
}

export function formatNumber(num: number, precision = 2) {
  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  return num;
}
