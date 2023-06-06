// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

import { AsyncData } from '../utils';
import { useAsyncMemo } from './useAsyncMemo';

export const GET_PROJECT = gql`
  query GetProjectStatus($id: String!) {
    project(id: $id) {
      id
      status
      queryEndpoint
    }
  }
`;

type Response = {
  project: {
    id: string;
    status: unknown;
    queryEndpoint: string;
  };
};

// XXXX untested
export function useApiEndpoint(indexerEndpoint?: string, deploymentId?: string): AsyncData<string | undefined> {
  return useAsyncMemo(async () => {
    if (!indexerEndpoint || !deploymentId) return undefined;

    const client = new ApolloClient({
      uri: indexerEndpoint,
      cache: new InMemoryCache(),
    });

    const res = await client.query<Response>({
      query: GET_PROJECT,
      variables: { id: deploymentId },
    });

    return res.data.project.queryEndpoint;
  }, [indexerEndpoint]);
}
