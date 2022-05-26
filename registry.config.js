// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

require('dotenv').config();

module.exports = {
    client: {
        service: {
            name: 'registry',
            url: process.env.REACT_APP_QUERY_REGISTRY_PROJECT, 
        },
        tagName: "gql",
        excludes: [
            'src/hooks/useApiEndpoint.ts',
            'src/containers/QueryLeaderboardProject.tsx',
        ]
    }
};