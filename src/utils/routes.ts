// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * The routes should be grouped based on tabs
 * Each routes group should come with ROOT ROUTE & SUB ROUTES
 */

// NOTE: Indexer tab
const INDEXER = {
  INDEXER: '/indexer',
  OFFER_MARKETPLACE: 'offers',
};

// NOTE: Consumer tab
const CONSUMER = {
  CONSUMER: '/consumer',
  FLEX_PLANS: 'flex-plans',
  PLAYGROUND: 'playground',
  ONGOING_PLANS: 'ongoing',
  EXPIRED_PLANS: 'closed',
  MY_OFFERS: 'my-offers',
  OPEN_OFFERS: 'open',
  CLOSE_OFFERS: 'close',
  EXPIRED_OFFERS: 'expired',
  CREATE_OFFER: 'create',
  OFFER_MARKETPLACE: 'offers',
};

const DELEGATOR = {
  DELEGATOR: '/delegation',
  DELEGATING: 'delegating',
  INDEXERS: 'indexers',
  ALL_INDEXERS: 'all',
  TOP_INDEXERS: 'top',
};

// TODO: Remove or ReOrg the “old” paths once renovation done
const PATHS = {
  ...INDEXER,
  ...DELEGATOR,
  ...CONSUMER,
  // ROOT PATHS
  EXPLORER: '/explorer',
  STUDIO: '/studio',
  SWAP: '/swap',
  STAKING: '/staking', //todo: improve
  PLANS: '/plans',

  // RELATIVE PATHS
  OVERVIEW: 'overview',
  INDEXERS: 'indexers',
  INDEXING: 'indexing',
  DELEGATE: 'delegate',
  MY_PROFILE: 'my-profile',
  MY_PLANS: 'my-plans',
  DEFAULT_PLANS: 'default',
  SPECIFIC_PLANS: 'specific',
  PLAYGROUND: 'playground',
  SERVICE_AGREEMENTS: 'service-agreements',
  REWARDS: 'rewards',
  LOCKED: 'locked',
  DETAILS: 'details',
  DEPLOYMENTS: 'deployments',
  SELL: 'sell',
  BUY: 'buy',
};

const NAV_LINKS = {
  // NAVIGATION LINKS
  // TODO: Remove or ReOrg the “old” paths once renovation done
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

  PLAYGROUND_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.FLEX_PLANS}/${CONSUMER.PLAYGROUND}`,
  CLOSED_PLANS_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.FLEX_PLANS}/${CONSUMER.EXPIRED_PLANS}`,
  ONGOING_PLANS_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.FLEX_PLANS}/${CONSUMER.ONGOING_PLANS}`,
  CONSUMER_OFFERS_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.MY_OFFERS}`,
  CONSUMER_OPEN_OFFERS_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.MY_OFFERS}/${CONSUMER.OPEN_OFFERS}`,
  CONSUMER_EXPIRED_OFFERS_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.MY_OFFERS}/${CONSUMER.EXPIRED_OFFERS}`,
  CONSUMER_OFFER_MARKETPLACE_NAV: `${CONSUMER.CONSUMER}/${CONSUMER.OFFER_MARKETPLACE}`,

  INDEXER_OFFER_MARKETPLACE_NAV: `${INDEXER.INDEXER}/${INDEXER.OFFER_MARKETPLACE}`,
};

export const ROUTES = {
  ...PATHS,
  ...NAV_LINKS,
};
