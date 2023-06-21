// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { parseError } from './parseError';

interface PostProps {
  endpoint: string;
  headers?: any;
  requestBody: any;
}

interface PostReturn {
  response?: Response;
  error?: Error | any;
}

export const POST = async ({ endpoint, headers, requestBody }: PostProps): Promise<PostReturn> => {
  let response, error;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(requestBody),
    });
  } catch (e) {
    parseError(e);
    error = e;
  }

  return { response, error };
};

export const getAuthReqHeader = (authToken: string): { Authorization: string } => ({
  Authorization: `Bearer ${authToken}`,
});
