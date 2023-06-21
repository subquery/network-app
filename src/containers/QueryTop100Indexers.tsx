// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';
import { GetTopIndexersQuery } from '@subql/network-query';

import { TOP_100_INDEXERS } from './QueryApolloProvider';

const GET_TOP_INDEXERS = gql`
  query GetTopIndexers {
    indexerPrograms {
      id
      delegated
      ownStaked
      rewardCollection
      socialCredibility
      sslEnabled
      updatedAt
      uptime
      totalPoints
      currICR
      nextICR
    }
  }
`;

export function useTopIndexers(): QueryResult<GetTopIndexersQuery> {
  return useQuery<GetTopIndexersQuery>(GET_TOP_INDEXERS, {
    context: { clientName: TOP_100_INDEXERS },
    pollInterval: 10000,
  });
}
