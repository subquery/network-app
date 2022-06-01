// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const INDEXER_CHALLENGE_PTS = [
  'INDEX_SINGLE',
  'INDEX_ALL',
  'ATTRACT_DELEGATOR',
  'CHANGE_COMMISSION',
  'DEFAULT_PLAN',
  'OVERRIDE_PLAN',
  'SERVICE_AGREEMENT',
  'CLAIM_REWARD',
  'WITHDRAW_CLAIMED',
  'INDEXER_UNDELEGATED',
  'UNREGISTER_INDEXER',
];

interface Details {
  points: number;
  description: string;
}

interface IndexerDetails {
  [key: string]: Details;
}

export const INDEXER_CHALLENGE_DETAILS: IndexerDetails = {
  INDEX_SINGLE: { points: 10, description: 'Fully index a project from demo projects list' },
  INDEX_ALL: { points: 50, description: 'Index all projects from demo projects list' },
  ATTRACT_DELEGATOR: { points: 20, description: 'Get your first delegator' },
  CHANGE_COMMISSION: { points: 10, description: 'Either increase of decrease commission rate' },
  DEFAULT_PLAN: { points: 50, description: 'Create a default plan' },
  OVERRIDE_PLAN: { points: 50, description: 'Create a override plan' },
  SERVICE_AGREEMENT: { points: 50, description: 'Get a service agreement from consumer' },
  CLAIM_REWARD: { points: 20, description: 'Indexer claims a reward' },
  WITHDRAW_CLAIMED: { points: 50, description: 'Delegator withdraws unstaked amount from indexer' },
  INDEXER_UNDELEGATED: { points: 20, description: 'Indexer gets delegation removed' },
  UNREGISTER_INDEXER: { points: 30, description: 'Unregister your indexer' },
};
