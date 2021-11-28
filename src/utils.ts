// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { utils } from 'ethers';

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

export type AsyncData<T> = { data?: T; loading: boolean; error?: Error };

export function mergeAsync<T1, T2>(v1: AsyncData<T1>, v2: AsyncData<T2>): AsyncData<[T1 | undefined, T2 | undefined]> {
  return {
    loading: v1.loading || v2.loading,
    error: v1.error || v2.error,
    data: [v1.data, v2.data],
  };
}

type RenderResult = React.ReactElement | null;

export function renderAsync<T>(
  data: AsyncData<T>,
  handlers: { loading: () => RenderResult; error: (error: Error) => RenderResult; data: (data?: T) => RenderResult },
): RenderResult {
  if (data.error) {
    return handlers.error(data.error);
  } else if (data.loading) {
    return handlers.loading();
  } else {
    try {
      return handlers.data(data.data);
    } catch (e) {
      // TODO not sure this is desired behaviour
      return handlers.error(e as Error);
    }
  }
}

export function concatU8A(a: Uint8Array, b: Uint8Array): Uint8Array {
  const res = new Uint8Array(a.length + b.length);
  res.set(a, 0);
  res.set(b, a.length);
  return res;
}
