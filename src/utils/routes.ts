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

  INDEXER: '/indexer',
  STAKING: '/staking', //todo: improve

  INDEXERS: '/indexers',
  ALL_INDEXERS: '/indexers/all',
  TOP_INDEXERS: '/indexers/rank',

  PLANS: '/plans',

  // V2
  DELEGATOR: '/delegation',
  DELEGATING_DELEGATOR: '/delegation/delegating',
  INDEXERS_DELEGATOR: '/delegation/indexers',
  ALL_INDEXERS_DELEGATOR: '/delegation/indexers/all',
  TOP_INDEXERS_DELEGATOR: '/delegation/indexers/top',

  CONSUMER: '/consumer',
  FLEXPLAN_CONSUMER: '/consumer/flex-plans',
  ONGOING_FLEXPLAN_CONSUMER: '/consumer/flex-plans/ongoing',
  CLOSED_FLEXPLAN_CONSUMER: '/consumer/flex-plans/closed',
  FLEXPLAN_PLAYGROUND_CONSUMER: '/consumer/flex-plans/playground',
};
