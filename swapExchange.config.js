// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

require('dotenv').config();

module.exports = {
  client: {
    service: {
      name: 'swapExchange',
      url: process.env.REACT_APP_QUERY_SWAP_EXCHANGE_PROJECT,
    },
    tagName: 'gql',
    excludes: [
      'src/hooks/useApiEndpoint.ts',
      'src/containers/IndexerRegistryProject.tsx',
      'src/containers/QueryRegistryProject.tsx',
      'src/containers/QueryLeaderboardProject.tsx',
      'src/containers/QuerySeason3Project.tsx',
    ],
  },
};
