// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import {
  GetConsumerChallengesVariables,
  GetConsumerChallenges,
} from '../__generated__/leaderboard-season3/GetConsumerChallenges';
import {
  GetDelegatorChallengesVariables,
  GetDelegatorChallenges,
} from '../__generated__/leaderboard-season3/GetDelegatorChallenges';

import {
  GetIndexerChallengesVariables,
  GetIndexerChallenges,
} from '../__generated__/leaderboard-season3/GetIndexerChallenges';
import { SEASON_3_CLIENT } from './QueryApolloProvider';

const GET_INDEXER_CHALLENGES = gql`
  query GetIndexerChallenges($account: String!) {
    indexer(id: $account) {
      id
      singleChallengePts
      singleChallenges
    }
  }
`;

const GET_CONSUMER_CHALLENGES = gql`
  query GetConsumerChallenges($account: String!) {
    consumer(id: $account) {
      id
      singleChallengePts
      singleChallenges
    }
  }
`;

const GET_DELEGATOR_CHALLENGES = gql`
  query GetDelegatorChallenges($account: String!) {
    delegator(id: $account) {
      id
      singleChallengePts
      singleChallenges
    }
  }
`;

export function useS3IndexerChallenges(params: GetIndexerChallengesVariables): QueryResult<GetIndexerChallenges> {
  return useQuery<GetIndexerChallenges, GetIndexerChallengesVariables>(GET_INDEXER_CHALLENGES, {
    variables: params,
    context: { clientName: SEASON_3_CLIENT },
  });
}

export function useS3ConsumerChallenges(params: GetConsumerChallengesVariables): QueryResult<GetConsumerChallenges> {
  return useQuery<GetConsumerChallenges, GetConsumerChallengesVariables>(GET_CONSUMER_CHALLENGES, {
    variables: params,
    context: { clientName: SEASON_3_CLIENT },
  });
}

export function useS3DelegatorChallenges(params: GetDelegatorChallengesVariables): QueryResult<GetDelegatorChallenges> {
  return useQuery<GetDelegatorChallenges, GetDelegatorChallengesVariables>(GET_DELEGATOR_CHALLENGES, {
    variables: params,
    context: { clientName: SEASON_3_CLIENT },
  });
}
