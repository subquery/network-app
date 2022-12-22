// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Web3Provider } from '@ethersproject/providers';
import {
  getEip721Signature,
  ConsumerHostMessageType,
  withChainIdRequestBody,
  authSARequestBody,
  ConsumerSAMessageType,
} from './eip712';
import { POST } from './fetch';
import { parseError } from './parseError';

export async function requestConsumerHostToken(
  account: string,
  library: Web3Provider | undefined,
): Promise<{ token?: string; error?: string }> {
  try {
    const tokenRequestUrl = `${process.env.REACT_APP_CONSUMER_HOST_ENDPOINT}/login`;
    const timestamp = new Date().getTime();

    const signMsg = {
      consumer: account,
      timestamp,
    };
    const eip721Signature = await getEip721Signature(signMsg, ConsumerHostMessageType, account, library);

    if (!eip721Signature) throw new Error();

    const { response, error } = await POST({
      endpoint: tokenRequestUrl,
      requestBody: withChainIdRequestBody(signMsg, eip721Signature),
    });

    const sortedResponse = response && (await response.json());

    if (error || !response?.ok || sortedResponse?.error) {
      throw new Error(sortedResponse?.error ?? error);
    }

    return sortedResponse;
  } catch (error) {
    console.error('Failed to request token of consumer host.');
    return { error: 'Failed to request token of consumer host.' };
  }
}

export async function requestServiceAgreementToken(
  account: string,
  library: Web3Provider | undefined,
  requestTokenUrl: string | undefined,
  indexer: string,
  agreement: string,
  deploymentId: string,
): Promise<{ token?: string; error?: string } | undefined> {
  try {
    const timestamp = new Date().getTime();
    if (!library || !account || !requestTokenUrl) return;

    const signMsg = {
      consumer: account,
      indexer,
      agreement,
      timestamp,
      deploymentId,
    };
    const eip721Signature = await getEip721Signature(signMsg, ConsumerSAMessageType, account, library);

    const tokenRequestBody = authSARequestBody(
      {
        consumer: account,
        timestamp: timestamp,
        indexer,
        agreement,
        deploymentId,
      },
      eip721Signature ?? '',
    );

    const { response, error } = await POST({ endpoint: requestTokenUrl, requestBody: tokenRequestBody });

    const sortedResponse = response && (await response.json());
    if (response?.ok) {
      return sortedResponse;
    } else {
      const sortedError = sortedResponse || error;
      throw new Error(parseError(sortedError));
    }
  } catch (error) {
    console.error('Failed to request token for service agreement.');
    return { error: 'Failed to request token for service agreement.' };
  }
}
