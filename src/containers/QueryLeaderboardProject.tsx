// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DocumentNode, gql, OperationVariables, QueryResult, TypedDocumentNode, useQuery } from '@apollo/client';
import { GetParticipantS2 } from '../__generated__/leaderboard/GetParticipantS2';
import { GetParticipantS3 } from '../__generated__/leaderboard/GetParticipantS3';
import { GetParticipantsS2 } from '../__generated__/leaderboard/GetParticipantsS2';
import { GetParticipantsS3 } from '../__generated__/leaderboard/GetParticipantsS3';

import { GET_PARTICIPANT_CHALLENGES_S2 } from './QuerySeason2Project';
import { GET_PARTICIPANT_CHALLENGES_S3 } from './QuerySeason3Project';

// DAILY TRACKING BACKEND
const GET_PARTICIPANTS_S2 = gql`
  query GetParticipantsS2 {
    indexersS2Challenges(orderBy: TOTAL_PTS_DESC, take: 200) {
      id
      name
      url
      totalPoints
      singlePoints
    }
  }
`;

const GET_PARTICIPANT_S2 = gql`
  query GetParticipantS2($indexerId: String!) {
    indexerS2Challenge(id: $indexerId) {
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
    }
  }
`;

const GET_PARTICIPANTS_S3 = gql`
  query GetParticipantsS3 {
    indexersS3Challenges(orderBy: TOTAL_PTS_DESC, take: 200) {
      id
      name
      url
      totalPoints
      singlePoints
    }
  }
`;

const GET_PARTICIPANT_S3 = gql`
  query GetParticipantS3($indexerId: String!) {
    indexerS3Challenges(id: $indexerId) {
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
    }
  }
`;

// QUERY FUNCTIONS FOR TRACKING BACKEND

function getParticipantsQuery(season: number): DocumentNode | TypedDocumentNode<any, OperationVariables> {
  if (season === 2) return GET_PARTICIPANTS_S2;
  if (season === 3) return GET_PARTICIPANTS_S3;
  throw new Error('Invalid season');
}

export function useParticipants(season = 3): QueryResult<GetParticipantsS2 | GetParticipantsS3> {
  const QUERY = getParticipantsQuery(season);
  return useQuery<any>(QUERY, {
    variables: {},
    context: { clientName: 'leaderboard' },
  });
}

function getParticipantQuery(season: number): DocumentNode | TypedDocumentNode<any, OperationVariables> {
  if (season === 2) return GET_PARTICIPANT_S2;
  if (season === 3) return GET_PARTICIPANT_S3;
  throw new Error('Invalid season');
}

export function useParticipant(season: number, params: any): QueryResult<GetParticipantS2 | GetParticipantS3> {
  const QUERY = getParticipantQuery(season);
  return useQuery<any, any>(QUERY, {
    variables: params,
    context: { clientName: 'leaderboard' },
  });
}

// QUERY FUNCTIONS FOR SUBQUERY PROJECTS

function getParticipantChallengesQuery(season: number): DocumentNode | TypedDocumentNode<any, OperationVariables> {
  if (season === 2) return GET_PARTICIPANT_CHALLENGES_S2;
  if (season === 3) return GET_PARTICIPANT_CHALLENGES_S3;
  throw new Error('Invalid season');
}

function getSeasonClientName(season: number): string {
  if (season === 2) return 'leaderboardS2';
  if (season === 3) return 'leaderboardS3';
  throw new Error('Invalid season');
}

export function useParticipantChallenges(season: number, params: any): QueryResult<any> {
  const CLIENT_NAME = getSeasonClientName(season);
  const QUERY = getParticipantChallengesQuery(season);
  return useQuery<any, any>(QUERY, {
    variables: params,
    context: { clientName: CLIENT_NAME },
  });
}
