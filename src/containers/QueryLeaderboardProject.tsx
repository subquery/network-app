// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql, QueryResult, useQuery } from '@apollo/client';
import { GetS3ChallengeRanks, GetS3ChallengeRanksVariables } from '../__generated__/leaderboard/GetS3ChallengeRanks';
import {
  GetS3ParticipantDailyChallenges,
  GetS3ParticipantDailyChallengesVariables,
} from '../__generated__/leaderboard/GetS3ParticipantDailyChallenges';
import { LEADERBOARD_CLIENT } from './QueryApolloProvider';

const GET_S3_CHALLENGE_RANKS = gql`
  query GetS3ChallengeRanks($participant: String!, $offset: Int) {
    S3Challenges(roleCategory: $participant, orderBy: TOTAL_PTS_DESC, offset: $offset) {
      consumerTotalPoints
      delegatorTotalPoints
      indexerTotalPoints
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
