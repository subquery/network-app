// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

export const ROUTES = {
  // ROOT PATHS
  EXPLORER: '/explorer',
  STUDIO: '/studio',
  SWAP: '/swap',
  STAKING: '/staking', //todo: improve
  PLANS: '/plans',
  DELEGATOR: '/delegation',
  CONSUMER: '/consumer',

  // RELATIVE PATHS
  OVERVIEW: 'overview',
  INDEXER: 'indexer',
  INDEXERS: 'indexers',
  INDEXING: 'indexing',
  DELEGATING: 'delegating',
  DELEGATE: 'delegate',
  FLEX_PLANS: 'flex-plans',
  MY_PROFILE: 'my-profile',
  MY_PLANS: 'my-plans',
  MY_OFFERS: 'my-offers',
  OFFER_MARKETPLACE: 'offers',
  OPEN_OFFERS: 'open',
  CLOSE_OFFERS: 'close',
  EXPIRED_OFFERS: 'expired',
  CREATE_OFFER: 'create',
  DEFAULT_PLANS: 'default',
  SPECIFIC_PLANS: 'specific',
  PLAYGROUND: 'playground',
  ONGOING_PLANS: 'ongoing',
  EXPIRED_PLANS: 'closed',
  SERVICE_AGREEMENTS: 'service-agreements',
  ALL_INDEXERS: 'all',
  TOP_INDEXERS: 'top',
  REWARDS: 'rewards',
  LOCKED: 'locked',
  DETAILS: 'details',
  DEPLOYMENTS: 'deployments',
  SELL: 'sell',
  BUY: 'buy',

  // NAVIGATION LINKS
  OPEN_OFFERS_NAV: '/plans/my-offers/open',
  EXPIRED_OFFERS_NAV: '/plans/my-offers/expired',
  OFFER_MARKETPLACE_NAV: '/plans/offers',
  SA_NAV: '/plans/service-agreements',
  SA_PLAYGROUND_NAV: '/plans/service-agreements/playground',
  SA_ONGOING_NAV: '/plans/service-agreements/ongoing',
  DELEGATE_NAV: '/staking/indexers/delegate',
  PROJECT_NAV: '/explorer/project',
  STUDIO_PROJECT_NAV: '/studio/project',
  STUDIO_CREATE_NAV: '/studio/create',

  PLAYGROUND_NAV: '/consumer/flex-plans/playground',
  CLOSED_PLANS_NAV: '/consumer/flex-plans/closed',
  ONGOING_PLANS_NAV: '/consumer/flex-plans/ongoing',
  CONSUMER_OFFERS_NAV: '/consumer/my-offers',
  CONSUMER_OPEN_OFFERS_NAV: '/consumer/my-offers/open',
  CONSUMER_EXPIRED_OFFERS_NAV: '/consumer/my-offers/expired',
  CONSUMER_OFFER_MARKETPLACE_NAV: '/consumer/offers',
};
