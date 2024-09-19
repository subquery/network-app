// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { captureException } from '@sentry/react';
import { openNotification } from '@subql/components';
import contractErrorCodes from '@subql/contract-sdk/publish/revertcode.json';
import { t } from 'i18next';
import { isObject, isString } from 'lodash-es';

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
  {
    error: 'sending a transaction requires a signer',
    message: "Please clear the cache and reconnect the wallet try again, can't detect the signer.",
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

export const isRPCError = (msg: Error | string | undefined): boolean => {
  if (!msg) return false;

  if (isString(msg)) {
    const stringMsg = msg.toLowerCase();
    if (
      stringMsg.includes?.("non-200 status code: '429'") ||
      stringMsg?.includes?.('event=') ||
      stringMsg?.includes?.('transaction reverted without a reason string')
    ) {
      return true;
    }

    return false;
  }

  if (Object.hasOwn(msg, 'message') || msg instanceof Error) {
    const stringMsg = msg?.message.toLowerCase();
    if (
      stringMsg?.includes?.("non-200 status code: '429'") ||
      stringMsg?.includes?.('event=') ||
      stringMsg?.includes?.('transaction reverted without a reason string')
    ) {
      return true;
    }
    return false;
  }

  try {
    // @ts-ignore
    const stringMsg = msg.toString().toLowerCase();

    if (
      stringMsg.includes("non-200 status code: '429'") ||
      stringMsg.includes?.('event=') ||
      stringMsg.includes?.('transaction reverted without a reason string')
    ) {
      return true;
    }
  } catch (e) {
    // ignore
  }

  return false;
};

export const isNetworkError = (msg: Error | string | undefined): boolean => {
  if (!msg) return false;

  if (isString(msg)) {
    const stringMsg = msg.toLowerCase();
    if (stringMsg.includes?.('network error')) {
      return true;
    }

    return false;
  }

  if (Object.hasOwn(msg, 'message') || msg instanceof Error) {
    const stringMsg = msg?.message.toLowerCase();
    if (stringMsg.includes?.('network error')) {
      return true;
    }
    return false;
  }

  try {
    // @ts-ignore
    const stringMsg = msg.toString().toLowerCase();

    if (stringMsg.includes?.('network error')) {
      return true;
    }
  } catch (e) {
    // ignore
  }

  return false;
};

export const isInsufficientAllowance = (msg: Error | string | undefined): boolean => {
  if (!msg) return false;

  if (isString(msg)) {
    if (msg?.includes?.('insufficient allowance')) {
      return true;
    }
    return false;
  }

  if (Object.hasOwn(msg, 'message')) {
    if (msg?.message?.includes?.('insufficient allowance')) {
      return true;
    }
    return false;
  }

  return false;
};

export const amountExceedsBalance = (msg: Error | string | undefined): boolean => {
  if (!msg) return false;

  if (isString(msg)) {
    if (msg?.includes?.('transfer amount exceeds balance')) {
      return true;
    }

    return false;
  }

  if (Object.hasOwn(msg, 'message')) {
    if (msg?.message?.includes?.('transfer amount exceeds balance')) {
      return true;
    }
    return false;
  }

  return false;
};

export const isNeedSignerToDoTransaction = (msg: Error | string | undefined): boolean => {
  if (!msg) return false;

  if (isString(msg)) {
    if (msg?.includes?.('sending a transaction requires a signer')) {
      return true;
    }

    return false;
  }

  if (Object.hasOwn(msg, 'message')) {
    if (msg?.message?.includes?.('sending a transaction requires a signer')) {
      return true;
    }
    return false;
  }

  if (msg.toString().includes('sending a transaction requires a signer')) {
    return true;
  }

  return false;
};

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
  const mappingError = () =>
    [...(options.errorMappings || []), ...errorsMapping].find((e) => rawErrorMsg.match(e.error))?.message;
  const mapContractError = () => {
    const revertCode = Object.keys(contractErrorCodes).find((key) =>
      rawErrorMsg.toString().match(`reverted: ${key}`),
    ) as keyof typeof contractErrorCodes;
    try {
      if (rawErrorMsg.includes('code=') || rawErrorMsg.includes('"from"')) {
        captureException(`Call contract error revert, need review: ${rawErrorMsg}`, {
          extra: {
            error: rawErrorMsg,
          },
        });
      }
    } finally {
      return revertCode ? contractErrorCodes[revertCode] : undefined;
    }
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

  const insufficientFunds = () => {
    if (rawErrorMsg.toString().match('insufficient funds for transfer')) {
      return 'Insufficient funds for this transaction. Please check your balance.';
    }
  };

  const exceedsBalance = () => {
    if (amountExceedsBalance(rawErrorMsg)) {
      return `Transfer amount exceeds balance`;
    }
  };

  const insufficientAllowance = () => {
    if (isInsufficientAllowance(rawErrorMsg)) {
      return 'Insufficient allowance. Please set a reasonable value when set spending cap';
    }
  };

  const needSignerMsg = () => {
    if (isNeedSignerToDoTransaction(rawErrorMsg)) {
      captureException(`Detected need signer error: ${rawErrorMsg}`, {
        extra: {
          error: rawErrorMsg,
        },
      });
      return "Can't detect the signer, please reconnect the wallet or clear the cache try again.";
    }
  };

  const generalErrorMsg = () => {
    try {
      if (!rawErrorMsg.includes('Failed to fetch')) {
        captureException(`Unknow error, need review: ${rawErrorMsg}`, {
          extra: {
            error: rawErrorMsg,
          },
        });
      }
    } finally {
      return 'Unfortunately, something went wrong.';
    }
  };

  const RpcUnavailableMsg = () => {
    if (isRPCError(error) || isRPCError(rawErrorMsg)) return t('general.rpcUnavailable');
  };

  const NetworkErrorMsg = () => {
    if (isNetworkError(error) || isNetworkError(rawErrorMsg)) {
      captureException(`Network error, need review: ${rawErrorMsg}`, {
        extra: {
          error: rawErrorMsg,
        },
      });
      return "Network error, can't connect to the server.";
    }
  };

  const msg =
    mapContractError() ??
    mappingError() ??
    userDeniedSignature() ??
    exceedsBalance() ??
    insufficientAllowance() ??
    RpcUnavailableMsg() ??
    NetworkErrorMsg() ??
    insufficientFunds() ??
    callRevert() ??
    needSignerMsg() ??
    options.defaultGeneralMsg ??
    generalErrorMsg();

  if (options.alert) {
    openNotification({
      type: 'error',
      description: msg,
      duration: 5,
    });
  }

  return msg;
}
