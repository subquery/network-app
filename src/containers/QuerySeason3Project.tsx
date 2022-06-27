// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { gql } from '@apollo/client';

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
