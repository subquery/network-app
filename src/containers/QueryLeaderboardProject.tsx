// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';
import { GetS3ChallengeRanks, GetS3ChallengeRanksVariables } from '../__generated__/leaderboard/GetS3ChallengeRanks';
import {
  GetS3ParticipantDailyChallenges,
  GetS3ParticipantDailyChallengesVariables,
} from '../__generated__/leaderboard/GetS3ParticipantDailyChallenges';
import { LEADERBOARD_CLIENT } from './QueryApolloProvider';

// TODO: skip & take for pagination
const GET_S3_CHALLENGE_RANKS = gql`
  query GetS3ChallengeRanks($roleCategory: ROLE_CATEGORY!) {
    S3Challenges(roleCategory: $roleCategory, orderBy: TOTAL_PTS_DESC, take: 2000) {
      totalCount
      challenges {
        consumerTotalPoints
        delegatorTotalPoints
        indexerTotalPoints
        totalPoints
        id
        name
        url
        rank
        indexerDailyChallenges {
          points
          title
          details
          timestamp
          deploymentId
        }
      }
    }
  }
`;

const GET_S3_PARTICIPANT_DAILY_CHALLENGES = gql`
  query GetS3ParticipantDailyChallenges($account: String!) {
    S3Challenge(id: $account) {
      consumerTotalPoints
      delegatorTotalPoints
      indexerTotalPoints
      id
      name
      url
      indexerDailyChallenges {
        points
        title
        details
        timestamp
        deploymentId
      }
    }
  }
`;

export function useS3ChallengeRanks(params: GetS3ChallengeRanksVariables): QueryResult<GetS3ChallengeRanks> {
  return useQuery<GetS3ChallengeRanks, GetS3ChallengeRanksVariables>(GET_S3_CHALLENGE_RANKS, {
    variables: params,
    context: { clientName: LEADERBOARD_CLIENT },
    fetchPolicy: 'network-only',
  });
}

export function useS3DailyChallenges(
  params: GetS3ParticipantDailyChallengesVariables,
): QueryResult<GetS3ParticipantDailyChallenges> {
  return useQuery<GetS3ParticipantDailyChallenges, GetS3ParticipantDailyChallengesVariables>(
    GET_S3_PARTICIPANT_DAILY_CHALLENGES,
    {
      variables: params,
      context: { clientName: LEADERBOARD_CLIENT },
    },
  );
}
