// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { STABLE_TOKEN_ADDRESS } from './USDC';
import testnet from '@subql/contract-sdk/publish/testnet.json';

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_WITH_TIME_FORMAT = 'DD/MM/YYYY hh:mm:ss A';

export enum LOCK_STATUS {
  LOCK = 'lock',
  UNLOCK = 'UNLOCK',
}

export const STABLE_TOKEN = import.meta.env.VITE_STABLE_TOKEN ?? 'USDC';

export const networkDeploymentDetails = testnet;
export const SQT_TOKEN_ADDRESS = testnet.SQToken.address;
export const TOKEN = import.meta.env.VITE_TOKEN ?? 'kSQT';

export const tokenDecimals: { [key: string]: number } = {
  [STABLE_TOKEN_ADDRESS]: 6,
  [SQT_TOKEN_ADDRESS]: 18,
};

export const tokenNames: { [key: string]: string } = {
  [STABLE_TOKEN_ADDRESS]: STABLE_TOKEN,
  [SQT_TOKEN_ADDRESS]: TOKEN,
};
