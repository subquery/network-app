// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { t } from 'i18next';

import { ROUTES } from '../router/routes';
export const externalAppLinks = [
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
    link: ROUTES.INDEXER,
    label: t('indexer.title'),
  },
  {
    link: ROUTES.CONSUMER,
    label: t('consumer'),
  },
  {
    link: ROUTES.DELEGATOR,
    label: t('delegator'),
  },
  {
    link: '/bridge',
    label: 'Swap',
  },
  {
    link: 'https://academy.subquery.network/subquery_network/kepler/welcome.html',
    label: t('header.documentation'),
  },
  {
    label: t('header.ecosystem'),
    dropdown: [
      {
        link: 'https://forum.subquery.network/c/kepler-network/16',
        label: t('header.forum'),
      },
      {
        link: 'https://snapshot.org/#/subquerynetwork.eth',
        label: t('header.governance'),
      },
    ],
  },
];
export const SUBQL_EXPLORER = 'https://explorer.subquery.network/';

export const SUBQL_HOST_SERVICE = 'https://managedservice.subquery.network/';

export const SUBQL_NETWORK_DOC = 'https://academy.subquery.network/subquery_network/kepler/welcome.html';

export const SUBQL_NETWORK_FORUM = 'https://forum.subquery.network/c/kepler-network/16';

export const SUBQL_NETWORK_GOVERNANCE = 'https://snapshot.org/#/kepler.subquerynetwork.eth';
