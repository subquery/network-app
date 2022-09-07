// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

require('dotenv').config();

module.exports = {
  client: {
    service: {
      name: 'leaderboard',
      url: process.env.REACT_APP_LEADERBOARD_PROJECT,
    },
    tagName: 'gql',
    excludes: [
      'src/hooks/useApiEndpoint.ts',
      'src/containers/IndexerRegistryProject.tsx',
      'src/containers/QueryRegistryProject.tsx',
      'src/containers/QuerySwapExchangeProject.tsx',
      'src/containers/QuerySeason3Project.tsx',
      'src/containers/QueryTop100Indexers.tsx',
    ],
  },
};
