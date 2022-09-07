// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { TOP_100_INDEXERS } from './QueryApolloProvider';

const GET_TOP_INDEXERS = gql`
  query GetTopIndexers {
    topIndexers {
      description
    }
  }
`;

export function useTopIndexers(): QueryResult<any> {
  return useQuery(GET_TOP_INDEXERS, {
    context: { clientName: TOP_100_INDEXERS },
  });
}

export const topIndexersMock = [
  {
    request: {
      query: GET_TOP_INDEXERS,
    },
    result: {
      data: {
        topIndexers: { description: 'This is mock data for top 100 indexers' },
      },
    },
  },
];
