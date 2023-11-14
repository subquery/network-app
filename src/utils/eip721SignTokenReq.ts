// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { FetcherReturnType } from '@graphiql/toolkit';

export const defaultQuery = `
  {
    _metadata {
      indexerHealthy
      indexerNodeVersion
    }
  }
`;

export async function fetcher(queryUrl: string, graphqlBody: string, sessionToken: string): Promise<FetcherReturnType> {
  const headers = {
    'Content-Type': 'application/json',
  };
  const sortedHeaders = sessionToken ? { ...headers, Authorization: `Bearer ${sessionToken}` } : headers;
  const data = await fetch(queryUrl, {
    method: 'POST',
    headers: sortedHeaders,
    body: graphqlBody,
  });
  return data.json().catch(() => data.text());
}
