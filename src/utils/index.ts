// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber, BigNumberish, utils } from 'ethers';
export * from './numberFormatters';
export * from './parseError';
export * from './getDeploymentProgress';
export * from './getTrimmedStr';
export * from './useDebounce';
export * from './fetch';
export * from './localStorage';

export function truncateAddress(address: string): string {
  if (!address) {
    return address;
  }
  return `${address.substr(0, 6)}...${address.substr(address.length - 4)}`;
}

export function genesisHashToName(genesisHash: string): string {
  switch (genesisHash) {
    case '0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3':
      return 'Polkadot';
    case '0x3fd7b9eb6a00376e5be61f01abb429ffb0b104be05eaff4d458da48fcd425baf':
      return 'Kusama';
    case '0x401a1f9dca3da46f5c4091016c8a2f26dcea05865116b286f60f668207d1474b':
      return 'Moonriver';
    case '0x956876d5b80e47e523a6629b3c3ac3e42f2850ad12e236d87a0aaac87c9f6bc9':
      return 'Moonbeam DEV';
    case '0x91bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e39527':
      return 'Moonbase Alpha';
    /* TODO add more network names */
    default:
      return genesisHash;
  }
}

export const CIDv0 = new RegExp(/Qm[1-9A-HJ-NP-Za-km-z]{44}/i);
export const CIDv1 = new RegExp(
  /Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}/i,
);

export function cidToBytes32(cid: string): string {
  return '0x' + Buffer.from(utils.base58.decode(cid)).slice(2).toString('hex');
}

export function bytes32ToCid(bytes: string): string {
  // Add our default ipfs values for first 2 bytes:
  // function:0x12=sha2, size:0x20=256 bits
  // and cut off leading "0x"
  const hashHex = '1220' + bytes.slice(2);
  const hashBytes = Buffer.from(hashHex, 'hex');
  return utils.base58.encode(hashBytes);
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  if (value === null || value === undefined) return false;

  // Extra typecheck
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _: TValue = value;
  return true;
}

export type AsyncData<T> = Readonly<{ data?: T; loading: boolean; error?: Error }>;

export function mergeAsync<T1, T2, T3, T4>(
  v1: AsyncData<T1>,
  v2: AsyncData<T2>,
  v3?: AsyncData<T3>,
  v4?: AsyncData<T4>,
): AsyncData<[T1 | undefined, T2 | undefined, T3 | undefined, T4 | undefined]> {
  return {
    loading: v1.loading || v2.loading || !!v3?.loading || !!v4?.loading,
    error: v1.error || v2.error || v3?.error || v4?.error,
    data: [v1.data, v2.data, v3?.data, v4?.data],
  };
}

export function mergeAsyncLast<T>(v1: AsyncData<unknown>, v2: AsyncData<T>): AsyncData<T> {
  return {
    loading: v1.loading || v2.loading,
    error: v1.error || v2.error,
    data: v2.data,
  };
}

export function mapAsync<O, T>(scope: (t: T) => O, data: AsyncData<T>): AsyncData<O> {
  return { ...data, data: data.data ? scope(data.data) : undefined };
}

type RenderResult = React.ReactElement | null;

type Handlers<T> = {
  loading: () => RenderResult;
  error: (error: Error) => RenderResult;
  data: (data: T, asyncData: AsyncData<T>) => RenderResult;
};

type HandlersArray<T extends any[]> = {
  loading: () => RenderResult;
  error: (error: Error) => RenderResult;
  data: (data: T, asyncData: AsyncData<T>) => RenderResult;
  empty: () => RenderResult;
};

export function renderAsync<T>(data: AsyncData<T>, handlers: Handlers<T>): RenderResult {
  if (data.data !== undefined) {
    try {
      return handlers.data(data.data, data);
    } catch (e) {
      // TODO not sure this is desired behaviour
      return handlers.error(e as Error);
    }
  } else if (data.error) {
    return handlers.error(data.error);
  } else if (data.loading) {
    return handlers.loading();
  }

  return null;
}

export function renderAsyncArray<T extends any[]>(data: AsyncData<T>, handlers: HandlersArray<T>): RenderResult {
  if (data.data !== undefined) {
    try {
      if (data.data === null || (Array.isArray(data.data) && !data.data.length)) {
        return handlers.empty();
      }
      return handlers.data(data.data, data);
    } catch (e) {
      // TODO not sure this is desired behaviour
      return handlers.error(e as Error);
    }
  }
  if (data.error) {
    return handlers.error(data.error);
  } else if (data.loading) {
    return handlers.loading();
  }

  return null;
}

export function concatU8A(a: Uint8Array, b: Uint8Array): Uint8Array {
  const res = new Uint8Array(a.length + b.length);
  res.set(a, 0);
  res.set(b, a.length);
  return res;
}

export const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '10px',
  },
  overlay: {
    zIndex: 50,
  },
};

export const newModalStyles = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: '0px',
  },
  overlay: {
    zIndex: 50,
  },
};

export interface ProviderRpcError extends Error {
  message: string;
  code: number;
  data?: unknown;
}

export function isEthError(e: unknown): e is ProviderRpcError {
  return !!(e as ProviderRpcError).code && !!(e as ProviderRpcError).message;
}

export function bnToDate(value: BigNumberish): Date {
  const valueBN = BigNumber.from(value);

  return new Date(valueBN.toNumber() * 1000);
}

class Cancelled extends Error {
  constructor(reason = '') {
    super(reason);
    Object.setPrototypeOf(this, Cancelled.prototype);
  }
}

export class CancellablePromise<T> extends Promise<T> {
  private _isCancelled: false | string = false;

  constructor(promise: Promise<T>) {
    super((resolve, reject) => {
      promise.then(
        (v) => {
          if (this._isCancelled) {
            reject(new Cancelled(this._isCancelled));
            return;
          }
          resolve(v);
        },
        (e) => {
          if (this._isCancelled) {
            reject(new Cancelled(this._isCancelled));
            return;
          }
          reject(e);
        },
      );
    });
  }

  public cancel(reason?: string): CancellablePromise<T> {
    this._isCancelled = reason ?? '';
    return this;
  }

  public get isCancelled(): boolean {
    return this._isCancelled !== false;
  }
}

export const trimEndSlash = (url: string): string => url.replace(/\/$/, '');

export function wrapProxyEndpoint(endpoint: string | undefined, indexerAddr: string): string | undefined {
  if (!endpoint) return undefined;
  if (endpoint.includes('https://')) {
    return endpoint;
  }

  return `https://gql-proxy.subquery.network/${indexerAddr}?to=${encodeURIComponent(endpoint)}`;
}
