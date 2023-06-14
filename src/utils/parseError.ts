// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { captureException } from '@sentry/react';
import contractErrorCodes from '@subql/contract-sdk/publish/revertcode.json';

export const walletConnectionErrors = [
  {
    error: 'No Ethereum provider was found on window.ethereum.',
    message: 'Please install Wallet browser extension',
  },
];

export const errors = [
  {
    error: 'apply pending changes first',
    message: 'There is pending stake or commission rate changes not finalized by indexer yet.',
  },

  {
    error: 'Not registered',
    message: 'Your address has not registered yet.',
  },
  {
    error: 'exceed daily',
    message: `You can not query as you have exceed daily limit.`,
  },
  {
    error: 'invalid project id',
    message: `Please check deployment id or indexer health.`,
  },
  {
    error: 'exceed rate limit',
    message: `You can not query as you have exceed rate limit.`,
  },
  {
    error: 'invalid request',
    message: `The Request is invalid.`,
  },
  {
    error: 'user rejected transaction',
    message: `The transaction has been rejected.`,
  },
  {
    error: 'network does not support ENS',
    message: `The address is not support ENS or invalid.`,
  },
];

const generalErrorMsg = 'Unfortunately, something went wrong.';

export function parseError(error: any, errorsMapping = errors): string | undefined {
  if (!error) return;
  console.log('error', error);
  const rawErrorMsg = error?.data?.message ?? error?.message ?? error?.error ?? error ?? '';

  const mappingError = () => errorsMapping.find((e) => rawErrorMsg.match(e.error))?.message;
  const mapContractError = () => {
    const revertCode = Object.keys(contractErrorCodes).find((key) =>
      rawErrorMsg.toString().match(`reverted: ${key}`),
    ) as keyof typeof contractErrorCodes;
    return revertCode ? contractErrorCodes[revertCode] : undefined;
  };

  // https://github.com/ethers-io/ethers.js/discussions/1856
  // it seems caused by network error or didn't deploy contract on network.
  // refresh will be ok. and just make sure called method have been deploy.
  const callRevert = () => {
    if (rawErrorMsg.toString().match(`CALL_EXCEPTION`)) {
      captureException(error);
      return 'Call revert exception. Please refresh the page and try again later.';
    }

    return;
  };
  return mappingError() ?? mapContractError() ?? callRevert() ?? generalErrorMsg;
}
