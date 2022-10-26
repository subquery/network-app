// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const walletConnectionErrors = [
  {
    error: 'No Ethereum provider was found on window.ethereum.',
    message: 'Please install Wallet browser extension',
  },
];

export const errors = [
  {
    error: 'apply pending changes first',
    message: 'Error: There is pending stake or commission rate changes not finalized by indexer yet.',
  },

  {
    error: 'Not registered',
    message: 'Error: Your address has not registered yet.',
  },
  {
    error: 'exceed daily',
    message: `Error: You can not query as you have exceed daily limit.`,
  },
  {
    error: 'invalid project id',
    message: `Error: Please check deployment id or indexer health.`,
  },
  {
    error: 'exceed rate limit',
    message: `Error: You can not query as you have exceed rate limit.`,
  },
  {
    error: 'invalid request',
    message: `Error: request invalid.`,
  },
];

const generalErrorMsg = 'Error: unfortunately, something went wrong.';

export function parseError(error: any, errorsMapping = errors): string {
  const rawErrorMsg = error?.data?.message ?? error?.message ?? error?.error ?? error;
  const sortedError = errorsMapping.find((e) => rawErrorMsg.match(e.error));

  return sortedError?.message ?? rawErrorMsg ?? generalErrorMsg;
}
