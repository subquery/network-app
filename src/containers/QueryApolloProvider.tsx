// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import React from 'react';

export const LEADERBOARD_CLIENT = 'leaderboard';
export const SEASON_2_CLIENT = 'season2';
export const SEASON_3_CLIENT = 'season3';

export const QueryApolloProvider: React.FC = (props) => {
  const registryLink = new HttpLink({
    uri: process.env.REACT_APP_QUERY_REGISTRY_PROJECT,
  });

  const leaderboardLink = new HttpLink({
    uri: process.env.REACT_APP_LEADERBOARD_PROJECT,
  });

  const season2Link = new HttpLink({
    uri: process.env.REACT_APP_SEASON_2,
  });

  const season3Link = new HttpLink({
    uri: process.env.REACT_APP_SEASON_3,
  });

  const client = new ApolloClient({
    link: ApolloLink.split(
      (operation) => operation.getContext().clientName === LEADERBOARD_CLIENT,
      leaderboardLink, // will use this link if client name specified in useQuery
      ApolloLink.split(
        (operation) => operation.getContext().clientName === SEASON_2_CLIENT,
        season2Link,
        ApolloLink.split(
          (operation) => operation.getContext().clientName === SEASON_3_CLIENT,
          season3Link,
          registryLink, // default link
        ),
      ),
    ),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            nodes: offsetLimitPagination(), // XXX untested
          },
        },
      },
    }),
  });

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
};
