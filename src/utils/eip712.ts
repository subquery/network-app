// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export interface Message {
  deploymentId: string;
  timestamp: number;
  indexer: string;
  agreement?: string;
  consumer?: string;
}

const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'chainId', type: 'uint256' },
];

const ConsumerMessageType = [
  { name: 'consumer', type: 'address' },
  { name: 'indexer', type: 'address' },
  { name: 'agreement', type: 'address' },
  { name: 'timestamp', type: 'uint256' },
  { name: 'deploymentId', type: 'string' },
];

const IndexerMessageType = [
  { name: 'indexer', type: 'address' },
  { name: 'timestamp', type: 'uint256' },
  { name: 'deploymentId', type: 'string' },
];

const domain = {
  name: 'Subquery',
  chainId: 1280,
};

export function buildTypedMessage(message: Message): string {
  const messageType = message.consumer ? ConsumerMessageType : IndexerMessageType;
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

export function authRequestBody(message: Message, signature: string) {
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
