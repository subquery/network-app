// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Web3Provider } from '@ethersproject/providers';

import { defaultChainId } from '../containers/Web3';

export interface SAMessage {
  deploymentId: string;
  timestamp: number;
  indexer: string;
  agreement?: string;
  consumer?: string;
}

export const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
];

export const ConsumerHostMessageType = [
  { name: 'consumer', type: 'address' },
  { name: 'timestamp', type: 'uint256' },
];

export const ConsumerSAMessageType = [
  { name: 'consumer', type: 'address' },
  { name: 'indexer', type: 'address' },
  { name: 'agreement', type: 'string' },
  { name: 'timestamp', type: 'uint256' },
  { name: 'deploymentId', type: 'string' },
];

export const trailSAMessageType = [
  { name: 'indexer', type: 'address' },
  { name: 'timestamp', type: 'uint256' },
  { name: 'deploymentId', type: 'string' },
];

const IndexerMessageType = [
  { name: 'indexer', type: 'address' },
  { name: 'timestamp', type: 'uint256' },
  { name: 'deploymentId', type: 'string' },
];

export const domain = {
  name: 'Subquery',
  chainId: defaultChainId,
};

export function buildTypedMessage(message: SAMessage): string {
  const messageType = message.consumer ? ConsumerSAMessageType : IndexerMessageType;
  return JSON.stringify({
    types: {
      EIP712Domain,
      messageType,
    },
    primaryType: 'messageType',
    domain,
    message,
  });
}

export function authSARequestBody(message: SAMessage, signature: string) {
  const { consumer, indexer, agreement, timestamp, deploymentId } = message;
  const baseBody = {
    indexer,
    timestamp,
    signature,
    deployment_id: deploymentId,
    chain_id: domain.chainId,
  };

  return consumer ? { ...baseBody, consumer, agreement } : baseBody;
}

export function withChainIdRequestBody<T>(message: T, signature: string) {
  return { ...message, signature, chain_id: domain.chainId };
}

export async function getEip721Signature<T>(
  message: T,
  messageType: Array<{ name: string; type: string }>,
  account: string,
  library: Web3Provider | undefined,
): Promise<string | undefined> {
  if (!library) return;

  const signMsg = JSON.stringify({
    types: {
      EIP712Domain,
      messageType,
    },
    primaryType: 'messageType',
    domain,
    message,
  });

  const hash = await library.send('eth_signTypedData_v4', [account, signMsg]);
  const signature = hash.replace(/^0x/, '') as string;

  return signature;
}
