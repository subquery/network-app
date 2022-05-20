// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

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
    const fetchResponse = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
      body: JSON.stringify(requestBody),
    });

    if (fetchResponse.ok) {
      response = fetchResponse;
    } else {
      const response = await fetchResponse.json();
      throw Error(response.message);
    }
  } catch (e) {
    console.log('Fetch error', e);
    error = e;
  }

  return { response, error };
};
