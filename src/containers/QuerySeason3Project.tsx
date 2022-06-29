// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useQuery, gql, QueryResult } from '@apollo/client';
import { GetConsumerPointsVariables, GetConsumerPoints } from '../__generated__/leaderboard-season3/GetConsumerPoints';
import {
  GetDelegatorPointsVariables,
  GetDelegatorPoints,
} from '../__generated__/leaderboard-season3/GetDelegatorPoints';

export const GET_PARTICIPANT_CHALLENGES_S3 = gql`
  query GetSingleChallengesS3($indexerId: String!) {
    indexer(id: $indexerId) {
      id
      singleChallengePts
      singleChallenges
    }

    delegator(id: $indexerId) {
      id
      singleChallengePts
      singleChallenges
    }

    consumer(id: $indexerId) {
      id
      singleChallengePts
      singleChallenges
    }
  }
`;

const CHALLENGE_POINTS = gql`
  fragment challengePoints on Consumer {
    id
    singleChallengePts
    singleChallenges
  }
`;

const GET_CONSUMER_POINTS = gql`
  ${CHALLENGE_POINTS}
  query GetConsumerPoints($account: String!) {
    consumer(id: $account) {
      ...challengePoints
    }
  }
`;

const GET_DELEGATOR_POINTS = gql`
  ${CHALLENGE_POINTS}
  query GetDelegatorPoints($account: String!) {
    consumer(id: $account) {
      ...challengePoints
    }
  }
`;

export function useConsumerPoints(params: GetConsumerPointsVariables): QueryResult<GetConsumerPoints> {
  return useQuery<GetConsumerPoints, GetConsumerPointsVariables>(GET_CONSUMER_POINTS, {
    variables: params,
    context: { clientName: 'leaderboardS3' },
  });
}

export function useDelegatorPoints(params: GetDelegatorPointsVariables): QueryResult<GetDelegatorPoints> {
  return useQuery<GetDelegatorPoints, GetDelegatorPointsVariables>(GET_DELEGATOR_POINTS, {
    variables: params,
    context: { clientName: 'leaderboardS3' },
  });
}
