// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { SQT_TOKEN_ADDRESS, SUPPORTED_NETWORK } from '@containers/Web3';
import { SQT_DECIMAL, STABLE_COIN_DECIMAL, STABLE_COIN_SYMBOLS, TOKEN_SYMBOLS } from '@subql/network-config';

import { STABLE_TOKEN_ADDRESS } from './USDC';

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_WITH_TIME_FORMAT = 'DD/MM/YYYY hh:mm:ss A';

export enum LOCK_STATUS {
  LOCK = 'lock',
  UNLOCK = 'UNLOCK',
}

export const STABLE_TOKEN = STABLE_COIN_SYMBOLS[SUPPORTED_NETWORK] ?? 'USDC';

export const TOKEN = TOKEN_SYMBOLS[SUPPORTED_NETWORK] ?? 'SQT';

export const tokenDecimals: { [key: string]: number } = {
  [STABLE_TOKEN_ADDRESS]: STABLE_COIN_DECIMAL,
  [SQT_TOKEN_ADDRESS]: SQT_DECIMAL,
};

export const tokenNames: { [key: string]: string } = {
  [STABLE_TOKEN_ADDRESS]: STABLE_TOKEN,
  [SQT_TOKEN_ADDRESS]: TOKEN,
};

export const categoriesOptions = [
  {
    label: 'Dictionary',
    value: 'Dictionary',
  },
  {
    label: 'DeFi',
    value: 'DeFi',
  },
  {
    label: 'Oracle',
    value: 'Oracle',
  },
  {
    label: 'Wallet',
    value: 'Wallet',
  },
  {
    label: 'NFT',
    value: 'NFT',
  },
  {
    label: 'Gaming',
    value: 'Gaming',
  },
  {
    label: 'Governance',
    value: 'Governance',
  },
  {
    label: 'Analytic',
    value: 'Analytic',
  },
  {
    label: 'Privacy',
    value: 'Privacy',
  },
];

export const rpcCategoriesOptions = [
  {
    label: 'Light Node',
    value: 'Light Node',
  },
  {
    label: 'Full Node',
    value: 'Full Node',
  },
  {
    label: 'Archive Node',
    value: 'Archive Node',
  },
  {
    label: 'EVM',
    value: 'EVM',
  },
  {
    label: 'Polkadot',
    value: 'Polkadot',
  },
  {
    label: 'Cosmos',
    value: 'Cosmos',
  },
];
