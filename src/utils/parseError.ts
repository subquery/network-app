// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { captureException } from '@sentry/react';
import contractErrorCodes from '@subql/contract-sdk/publish/revertcode.json';
import { isObject } from 'lodash-es';

export const walletConnectionErrors = [
  {
    error: 'No Ethereum provider was found on window.ethereum.',
    message: 'Please install Wallet browser extension',
  },
];

export const errorsMapping = [
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

export enum USER_REJECT {
  USER_DENIED_SIGNATURE = 'User denied message signature',
}

function logError(msg: Error): void;
function logError(msg: Record<string, unknown>): void;
function logError(msg: string): void;
function logError(msg: Error | string | Record<string, unknown>): void {
  if (msg instanceof Error) {
    return console.error(msg);
  }
  if (isObject(msg)) {
    return console.error(`%c [Error] ${JSON.stringify(msg)}`, 'color:lightgreen;');
  }
  return console.error(`%c [Error] ${msg}`, 'color:lightgreen;');
}

export function parseError(
  error: any,
  options: { alert?: boolean; defaultGeneralMsg?: string | null; errorMappings?: typeof errorsMapping } = {
    alert: false,
    defaultGeneralMsg: null,
    errorMappings: errorsMapping,
  },
): string | undefined {
  if (!error) return;
  logError(error);
  const rawErrorMsg = error?.data?.message ?? error?.message ?? error?.error ?? error ?? '';

  const mappingError = () => (options.errorMappings || errorsMapping).find((e) => rawErrorMsg.match(e.error))?.message;
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
      return 'Network unstable. Please refresh the page or change the RPC URL and try again later.';
    }

    return;
  };

  const userDeniedSignature = () => {
    if (rawErrorMsg.toString().match(USER_REJECT.USER_DENIED_SIGNATURE)) {
      return USER_REJECT.USER_DENIED_SIGNATURE;
    }

    return;
  };

  const generalErrorMsg = () => {
    try {
      captureException(error);
    } finally {
      return 'Unfortunately, something went wrong.';
    }
  };

  return (
    mappingError() ??
    mapContractError() ??
    callRevert() ??
    userDeniedSignature() ??
    options.defaultGeneralMsg ??
    generalErrorMsg()
  );
}
