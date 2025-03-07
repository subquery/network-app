// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { t } from 'i18next';

import { ROUTES } from '../router/routes';
export const externalAppLinks = [
  {
    label: t('header.self.title'),
    description: t('header.self.description'),
    link: '/',
  },
  {
    label: t('header.externalExplorer.title'),
    description: t('header.externalExplorer.description'),
    link: 'https://explorer.subquery.network/',
  },
  {
    label: t('header.managedService.title'),
    description: t('header.managedService.description'),
    link: 'https://managedservice.subquery.network/',
  },
  {
    label: 'Professional Services',
    description:
      'SubQuery has a team of talented engineers and data-scientists that can provide results driven data solutions for entrepreneurs, startups, and enterprises. We’ll build and operate custom data processing pipelines for you.',
    link: 'https://subquery.network/professional',
  },
];

const {
  MY_PROJECTS,
  MY_PLANS,
  SERVICE_AGREEMENTS,
  OFFER_MARKETPLACE,
  MY_DELEGATORS,
  FLEX_PLANS,
  MY_OFFERS,
  DELEGATOR_INDEXERS,
  DELEGATING,
} = ROUTES;

export const IndexerSidebar = [
  {
    label: t('myProjects.title'),
    link: `/${ROUTES.INDEXER}/${MY_PROJECTS}`,
  },
  {
    label: t('indexer.myDelegators'),
    link: `/${ROUTES.INDEXER}/${MY_DELEGATORS}`,
  },
  {
    label: t('plans.category.serviceAgreement'),
    link: `/${ROUTES.INDEXER}/${SERVICE_AGREEMENTS}`,
  },
  {
    label: t('indexer.myPlans'),
    link: `/${ROUTES.INDEXER}/${MY_PLANS}`,
  },
  {
    label: t('plans.category.offerMarketplace'),
    link: `/${ROUTES.INDEXER}/${OFFER_MARKETPLACE}`,
  },
  {
    label: 'All Node Operators',
    link: `/${ROUTES.INDEXER}/all-indexers`,
  },
];

export const ConsumerSidebar = [
  {
    label: t('plans.category.myFlexPlans'),
    link: `/${ROUTES.CONSUMER}/${FLEX_PLANS}`,
  },
  {
    label: 'My Boosted Projects',
    link: `/${ROUTES.CONSUMER}/boosted-projects`,
  },
  {
    label: t('plans.category.myOffers'),
    link: `/${ROUTES.CONSUMER}/${MY_OFFERS}`,
  },
  {
    label: t('plans.category.serviceAgreement'),
    link: `/${ROUTES.CONSUMER}/${SERVICE_AGREEMENTS}`,
  },
  {
    label: t('plans.category.offerMarketplace'),
    link: `/${ROUTES.CONSUMER}/${OFFER_MARKETPLACE}`,
  },
];

export const DelegatorSidebar = [
  {
    label: 'My Delegation',
    link: `/${ROUTES.DELEGATOR}/${DELEGATING}`,
  },
  {
    label: 'Node Operators',
    link: `/${ROUTES.DELEGATOR}/${DELEGATOR_INDEXERS}`,
  },
];

export const studioLink = {
  link: ROUTES.STUDIO,
  label: t('header.studio'),
};

export const entryLinks = [
  {
    link: ROUTES.DASHBOARD,
    label: t('dashboardHeader.title'),
  },
  {
    link: ROUTES.EXPLORER,
    key: 'explorer',
    label: t('header.explorer'),
    dropdown: [studioLink],
  },
  {
    key: 'indexer',
    link: ROUTES.INDEXER,
    label: t('indexer.title'),
    dropdown: IndexerSidebar,
  },
  {
    key: 'consumer',
    link: ROUTES.CONSUMER,
    label: t('consumer'),
    dropdown: ConsumerSidebar,
  },
  {
    key: 'delegator',
    link: ROUTES.DELEGATOR,
    label: t('delegator'),
    dropdown: DelegatorSidebar,
  },
  {
    link: 'https://academy.subquery.network/subquery_network/kepler/welcome.html',
    label: t('header.documentation'),
  },
];
export const SUBQL_EXPLORER = 'https://explorer.subquery.network/';

export const SUBQL_HOST_SERVICE = 'https://managedservice.subquery.network/';

export const SUBQL_NETWORK_DOC = 'https://academy.subquery.network/subquery_network/kepler/welcome.html';

export const SUBQL_NETWORK_FORUM = 'https://forum.subquery.network/c/kepler-network/16';

export const SUBQL_NETWORK_GOVERNANCE = 'https://snapshot.org/#/kepler.subquerynetwork.eth';
