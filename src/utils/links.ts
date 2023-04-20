// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { t } from 'i18next';
import { ROUTES } from './routes';

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
    link: ROUTES.EXPLORER,
    label: t('header.explorer'),
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
    link: ROUTES.SWAP,
    label: t('header.swap'),
  },
  {
    link: 'https://academy.subquery.network/subquery_network/testnet/welcome.html',
    label: t('header.documentation'),
  },
  {
    label: t('header.ecosystem'),
    dropdown: [
      {
        link: 'https://forum.subquery.network/c/season-3/6',
        label: t('header.forum'),
      },
      {
        link: 'https://snapshot.org/#/subquerynetwork.eth',
        label: t('header.governance'),
      },
    ],
  },
];
