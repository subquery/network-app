// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';

import { GetTopIndexers } from '../__generated__/excellentIndexers/GetTopIndexers';
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

export function useTopIndexers(): QueryResult<GetTopIndexers> {
  return useQuery<GetTopIndexers>(GET_TOP_INDEXERS, {
    context: { clientName: TOP_100_INDEXERS },
    pollInterval: 10000,
  });
}
