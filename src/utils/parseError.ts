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
];

const generalErrorMsg = 'Error: unfortunately, something went wrong.';

export function parseError(error: any, errorsMapping = errors): string {
  const rawErrorMsg = error?.data?.message ?? error?.message;

  if (!rawErrorMsg) return generalErrorMsg;

  const sortedError = errorsMapping.find((e) => rawErrorMsg.match(e.error));

  return sortedError?.message ?? rawErrorMsg;
}
