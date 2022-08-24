// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_WITH_TIME_FORMAT = 'DD/MM/YYYY hh:mm:ss A';

export enum LOCK_STATUS {
  LOCK = 'lock',
  UNLOCK = 'UNLOCK',
}

export const STABLE_TOKEN = 'aUSD';
//Todo: Temp stable token, switch to aUSD contract sdk
export const STABLE_TOKEN_ADDRESS = 0xf98bf104e268d7cbb7949029fee874e3cd1db8fa;
export const TOKEN = 'kSQT';
export const tokenDecimals: { [key: string]: number } = {
  [STABLE_TOKEN]: 12,
  [TOKEN]: 18,
};
