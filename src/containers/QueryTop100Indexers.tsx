// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { TOP_100_INDEXERS } from './QueryApolloProvider';
import { GetTopIndexers } from '../__generated__/excellentIndexers/GetTopIndexers';

// TODO: consumer query from sdk
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
    }
  }
`;

export function useTopIndexers(): QueryResult<GetTopIndexers> {
  return useQuery<GetTopIndexers>(GET_TOP_INDEXERS, {
    context: { clientName: TOP_100_INDEXERS },
    pollInterval: 10000,
  });
}
