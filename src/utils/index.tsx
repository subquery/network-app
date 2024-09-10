// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { OperationVariables, QueryResult } from '@apollo/client';
import { Spinner } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { cloneDeep } from 'lodash-es';

import { parseError } from './parseError';
export * from '../router/routes';
export * from './colors';
export * from './constants';
export * from './dateFormatters';
export * from './eip721SignTokenReq';
export * from './fetch';
export * from './getDeploymentProgress';
export * from './getFlexPlanPrice';
export * from './getOrderedAccounts';
export * from './getTrimmedStr';
export * from './localStorage';
export * from './numberFormatters';
export * from './parseError';
export * from './stringFormatters';
export * from './USDC';
export * from './useDebounce';

export { renderAsync };

export function strip(num: number, fixed = 4): string {
  const stringNum = `${num}`;
  const compile = new RegExp(`\\d+\\.\\d{${fixed}}`);
  const withDot = stringNum.match(compile);
  if (withDot) return withDot[0];
  const base = 10 ** fixed;
  return (Math.round(num * base) / base).toFixed(fixed);
}

export function truncateAddress(address: string): string {
  if (!address) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
}

export function truncateDeploymentId(deploymentId: string): string {
  if (!deploymentId) {
    return deploymentId;
  }

  return `${deploymentId.slice(0, 6)}......${deploymentId.slice(deploymentId.length - 6)}`;
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

  const _: TValue = value;
  return true;
}

export const filterSuccessPromoiseSettledResult = <T,>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> => result.status === 'fulfilled';

export type AsyncData<T> = Readonly<{ data?: T; loading: boolean; error?: Error; refetch?: () => void }>;
type Data<T> = T | undefined;
type MergedData<T1, T2, T3, T4, T5, T6> = [Data<T1>, Data<T2>, Data<T3>, Data<T4>, Data<T5>, Data<T6>];
// NOTE: update mergeAsync returnType when migrate to sdk
export function mergeAsync<T1, T2, T3, T4, T5, T6>(
  v1: AsyncData<T1>,
  v2: AsyncData<T2>,
  v3?: AsyncData<T3>,
  v4?: AsyncData<T4>,
  v5?: AsyncData<T5>,
  v6?: AsyncData<T6>,
): AsyncData<MergedData<T1, T2, T3, T4, T5, T6>> {
  const mergeT = [v1, v2, v3, v4, v5, v6];
  const filteredMergeT = mergeT.filter((v) => v);
  const loading = filteredMergeT.find((v) => v?.loading)?.loading;
  const error = filteredMergeT.find((v) => v?.error)?.error;
  const data = filteredMergeT.map((v) => v?.data) as MergedData<T1, T2, T3, T4, T5, T6>;

  return {
    loading: !!loading,
    error,
    data,
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

type HandlersArray<T extends any[]> = {
  loading?: () => RenderResult;
  error: (error: Error) => RenderResult;
  data: (data: T, asyncData: AsyncData<T>) => RenderResult;
  empty: () => RenderResult;
};

const defaultLoading = () => <Spinner />;

/**
 * NOTE: re-consider scenario -> when one exist while another is undefined
 * Two solution:
 * 1) undefined is from loading or actual value, or use null as actual value
 * 2) when there is value in array, handle by the rest component
 *
 */
export function renderAsyncArray<T extends any[]>(data: AsyncData<T>, handlers: HandlersArray<T>): RenderResult {
  if (data.error) {
    parseError(data.error);
    return handlers.error(data.error);
  } else if (data.loading) {
    return handlers.loading ? handlers.loading() : defaultLoading();
  }

  if (data.data?.findIndex((d) => d === undefined) === -1) {
    try {
      if (data.data === null || (Array.isArray(data.data) && !data.data.length)) {
        return handlers.empty();
      }
      return handlers.data(data.data, data);
    } catch (e) {
      parseError(e);
      // TODO not sure this is desired behaviour
      return handlers.error(e as Error);
    }
  }

  return handlers.empty();
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

/**
 *  NOTE: You don't need this.
 *  NOTE: You can cancel a Promise with React.useEffect or use swr for data
 */
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

  return `${import.meta.env.VITE_GQL_PROXY}/${indexerAddr}?to=${encodeURIComponent(
    endpoint.replace(/([^:]\/)\/+/g, '$1'),
  )}`;
}

export function getUseQueryFetchMore<TData = any, TVariables extends OperationVariables = OperationVariables>(
  queryFn: QueryResult<TData, TVariables>,
  params?: TVariables,
): void {
  queryFn.fetchMore({
    variables: params,
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) return previousResult;
      return { ...fetchMoreResult };
    },
  });
}

export function isUndefined(val: unknown): boolean {
  return val === undefined;
}

export function isNull(val: unknown): boolean {
  return val === null;
}

export function numToHex(val: number) {
  // Note: this is equal to the hex algorithm of eraId
  // 105 => 0x69
  // 810 => 0x032a
  return BigNumber.from(val).toHexString();
}

export const DeepCloneAndChangeReadonlyToMutable = <T extends object>(val: T): Mutable<T> => {
  return cloneDeep<Mutable<T>>(val);
};

export type ExcludeNull<T> = T extends null ? never : T;

export type Mutable<T> = {
  -readonly [K in keyof T]: Mutable<T[K]>;
};
