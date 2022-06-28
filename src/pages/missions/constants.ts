// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

interface Details {
  points: number;
  description: string;
}

export interface IndexerDetails {
  [key: string]: Details;
}

export const INDEXER_CHALLENGE_DETAILS: IndexerDetails = {
  INDEX_SINGLE_PROJECT: { points: 10, description: 'Fully index a project from projects list' },
  INDEX_ALL_PROJECTS: { points: 200, description: 'Index all projects from projects list' },
  DELEGATOR_ATTRACTED: { points: 20, description: 'Get your first delegator' },
  CHANGE_COMMISSION: { points: 10, description: 'Either increase of decrease commission rate' },
  CREATE_DEFAULT_PLAN: { points: 50, description: 'Create a default plan' },
  CREATE_SPECIFIC_PLAN: { points: 50, description: 'Create a deployment-specific plan' },
  SERVICE_AGREEMENT_CREATED: { points: 50, description: 'Get a service agreement from consumer' },
  CLAIM_REWARD: { points: 20, description: "Indexer claims a reward from reward distributor to an indexer's wallet" },
  WITHDRAW_UNSTAKED: {
    points: 50,
    description: "Indexer withdraws unstaked amount from staking contract to an indexer's wallet",
  },
  INDEXER_UNDELEGATED: { points: 20, description: 'Indexer gets undelegated from delegator' },
  ACCEPT_OFFER: { points: 50, description: 'Indexer to accept an offer in the offer market' },
  UPDATE_CONTROLLER: { points: 30, description: 'Update controller account to new one' },
  UNREGISTER_INDEXER: { points: 30, description: 'Unregister your indexer' },
};

export const DELEGATOR_CHALLENGE_DETAILS: IndexerDetails = {
  CLAIM_REWARD: { points: 20, description: "Delegator claims a reward from reward distributor to delegator's wallet" },
  DELEGATE_TO_INDEXER: { points: 50, description: 'Delegator add delegation to an indexer' },
  UNDELEGATE_FROM_INDEXER: { points: 50, description: 'Delegator undelegate from an indexer' },
  WITHDRAW_DELEGATION: { points: 50, description: 'Delegator withdraws undelegated amount from an indexer' },
};

export const CONSUMER_CHALLENGE_DETAILS: IndexerDetails = {
  PURCHASE_PLAN: { points: 50, description: 'Consumer purchase a plan from an indexer' },
  CREATE_PURCHASE_OFFER: { points: 50, description: 'A purchase offer is created by consumer' },
  SERVICE_AGREEMENT_CREATED: { points: 50, description: 'Get service agreement from an indexer' },
  CANCEL_PURCHASE_OFFER: { points: 30, description: 'Cancel offer before it expires' },
  WITHDRAW_PURCHASE_OFFER: { points: 30, description: 'Withdraw SQT locked in the offer after it expires' },
};

export enum MISSION_TYPE {
  INDEXER = 'indexer',
  DELEGATOR = 'delegator',
  CONSUMER = 'consumer',
}

export function getMissionDetails(missionType: MISSION_TYPE): IndexerDetails {
  if (missionType === MISSION_TYPE.INDEXER) return INDEXER_CHALLENGE_DETAILS;
  if (missionType === MISSION_TYPE.DELEGATOR) return DELEGATOR_CHALLENGE_DETAILS;
  if (missionType === MISSION_TYPE.CONSUMER) return CONSUMER_CHALLENGE_DETAILS;
  throw new Error('Invalid mission type');
}

type Season = {
  [key: number]: {
    from: Date;
    to: Date;
  };
};

export const SEASONS: Season = {
  2: { from: new Date(2022, 3, 24, 0, 0), to: new Date(2022, 4, 23, 11, 59) },
  3: { from: new Date(2022, 5, 21, 0, 0), to: new Date(2022, 6, 5, 11, 59) },
};

export const CURR_SEASON = 3;
