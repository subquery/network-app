// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';
import { GetIndexers, GetIndexers_indexerChallenges } from '../__generated__/leaderboard/GetIndexers';

//FIXME: orderby might need to be enum
const GET_INDEXERS = gql`
  query GetIndexers {
    indexerChallenges(orderBy: TOTAL_PTS_DESC, take: 200) {
      id
      name
      url
      totalPoints
      singlePoints
      singleChallenges {
        details
        points
        title
      }
    }
  }
`;

const GET_INDEXER = gql`
  query GetIndexer($indexerId: String!) {
    indexerChallenge(id: $indexerId) {
      id
      name
      url
      totalPoints
      singlePoints
      singleChallenges {
        details
        points
        title
      }
    }
  }
`;

export function useLeaderboard(): QueryResult<GetIndexers> {
  return useQuery<GetIndexers>(GET_INDEXERS, {
    variables: {},
    context: { clientName: 'leaderboard' },
  });
}

export function useIndexerChallenges(id: string): QueryResult<GetIndexers_indexerChallenges> {
  return useQuery<GetIndexers_indexerChallenges>(GET_INDEXER, {
    variables: {
      indexerId: id,
    },
    context: { clientName: 'leaderboard' },
  });
}
