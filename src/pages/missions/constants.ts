// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import moment from 'moment';

// Path
export const ROOT_ROUTE = '/missions';
export const MISSION_ROUTE = `/missions/my-missions`;
export const LEADERBOARD_ROUTE = `/missions/ranks`;
export const OWN_INDEXER_PARTICIPANT = `${MISSION_ROUTE}/indexer`;
export const OWN_DELEGATOR_PARTICIPANT = `${MISSION_ROUTE}/delegator`;
export const OWN_CONSUMER_PARTICIPANT = `${MISSION_ROUTE}/consumer`;

interface MISSION {
  points: number;
  description: string;
}

export interface MISSIONS {
  [key: string]: MISSION;
}

// one-off challenges of indexers
export const INDEXER_CHALLENGE_DETAILS: MISSIONS = {
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
};

// one-off challenges of delegators
export const DELEGATOR_CHALLENGE_DETAILS: MISSIONS = {
  CLAIM_REWARD: { points: 20, description: "Delegator claims a reward from reward distributor to delegator's wallet" },
  DELEGATE_TO_INDEXER: { points: 50, description: 'Delegator add delegation to an indexer' },
  UNDELEGATE_FROM_INDEXER: { points: 50, description: 'Delegator undelegate from an indexer' },
  WITHDRAW_DELEGATION: { points: 50, description: 'Delegator withdraws undelegated amount from an indexer' },
};

// one-off challenges of consumer
export const CONSUMER_CHALLENGE_DETAILS: MISSIONS = {
  PURCHASE_PLAN: { points: 50, description: 'Consumer purchase a plan from an indexer' },
  CREATE_PURCHASE_OFFER: { points: 50, description: 'A purchase offer is created by consumer' },
  SERVICE_AGREEMENT_CREATED: { points: 50, description: 'Get service agreement from an indexer' },
  CANCEL_PURCHASE_OFFER: { points: 30, description: 'Cancel offer before it expires' },
  WITHDRAW_PURCHASE_OFFER: { points: 30, description: 'Withdraw SQT locked in the offer after it expires' },
};

export enum PARTICIPANT {
  INDEXER = 'indexer',
  DELEGATOR = 'delegator',
  CONSUMER = 'consumer',
}

export const missionMapping = {
  [PARTICIPANT.INDEXER]: INDEXER_CHALLENGE_DETAILS,
  [PARTICIPANT.DELEGATOR]: DELEGATOR_CHALLENGE_DETAILS,
  [PARTICIPANT.CONSUMER]: CONSUMER_CHALLENGE_DETAILS,
};

export enum MISSION_STATUS {
  INCOMPLETE = 'Incomplete',
  COMPLETED = 'Completed',
  EXPIRED = 'Expired',
}

// TODO: make 'one-off', 'daily' as i18n
export enum MISSION_TYPE {
  ONE_OFF = 'One-off',
  DAILY = 'Daily',
}

type Season = {
  [key: number]: {
    from: Date;
    to: Date;
  };
};

// Share with App global banner
export const SEASON3 = {
  START: new Date(1656496800000), //'June 29 2022 22:00 NZDT'
  END: new Date(1658447940000), //11:59 22Jul 2022 NZDT - 23:59 21Jul 2022 UTC
};

export const SEASONS: Season = {
  2: { from: new Date(2022, 3, 24, 0, 0), to: new Date(2022, 4, 23, 11, 59) },
  3: { from: SEASON3.START, to: SEASON3.END },
};

export const CURR_SEASON = 3;
