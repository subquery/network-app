// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * Routes Example:
 * - Explorer Root ->  EXPLORER: '/explorer',
 * - Projects within Explorer -> PROJECTS_EXPLORER: '/explorer/projects',
 *
 */
export const ROUTES = {
  EXPLORER: '/explorer',
  STUDIO: '/studio',
  SWAP: '/swap',
  STAKING: '/staking', //todo: improve
  PLANS: '/plans',
  INDEXER: '/indexer',

  INDEXERS: 'indexers',
  ALL_INDEXERS: 'all',
  TOP_INDEXERS: 'rank',

  // V2
  DELEGATOR: '/delegation',
  DELEGATING_DELEGATOR: 'delegating',
  INDEXERS_DELEGATOR: 'indexers',
  ALL_INDEXERS_DELEGATOR: 'all',
  TOP_INDEXERS_DELEGATOR: 'top',

  CONSUMER: '/consumer',
  FLEXPLAN_CONSUMER: 'flex-plans',
  ONGOING_FLEXPLAN_CONSUMER: 'ongoing',
  CLOSED_FLEXPLAN_CONSUMER: 'closed',
};
