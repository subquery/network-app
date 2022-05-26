// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';
import { GetIndexer } from '../__generated__/leaderboard/GetIndexer';
import { GetIndexers } from '../__generated__/leaderboard/GetIndexers';
import { GetIndexerVariables } from '../__generated__/leaderboard/GetIndexer';

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
      challenges {
        point
        timestamp
        title
        deploymentId
      }
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

export function useIndexerChallenges(params: GetIndexerVariables): QueryResult<GetIndexer> {
  return useQuery<GetIndexer, GetIndexerVariables>(GET_INDEXER, {
    variables: params,
    context: { clientName: 'leaderboard' },
  });
}
