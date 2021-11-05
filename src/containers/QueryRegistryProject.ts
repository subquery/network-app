// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const GET_PROJECT_DEPLOYMENTS = gql`
  query {
    projects(filter: { id: { equalTo: $id } }) {
      deployments {
        id
        version
        indexers
      }
    }
  }
`;

const GET_DEPLOYMENT_INDEXERS = gql``;
