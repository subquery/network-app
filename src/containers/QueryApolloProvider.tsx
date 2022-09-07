// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import React from 'react';

const getHttpLink = (uri: string | undefined) => new HttpLink({ uri });

export const LEADERBOARD_CLIENT = 'leaderboard';
export const SEASON_3_CLIENT = 'season3';

export const SWAP_EXCHANGE_CLIENT = 'swapExchange';
const swapLink = getHttpLink(process.env.REACT_APP_QUERY_SWAP_EXCHANGE_PROJECT);

export const TOP_100_INDEXERS = 'top100Indexers';
const top100IndexersLink = getHttpLink(process.env.REACT_APP_TOP_100_INDEXERS);

const registryLink = getHttpLink(process.env.REACT_APP_QUERY_REGISTRY_PROJECT);

export const QueryApolloProvider: React.FC = (props) => {
  const client = new ApolloClient({
    link: ApolloLink.split(
      (operation) => operation.getContext().clientName === SWAP_EXCHANGE_CLIENT,
      swapLink,
      registryLink,
      // ApolloLink.split(
      //   (operation) => operation.getContext().clientName === TOP_100_INDEXERS,
      //   top100IndexersLink,
      //   swapLink,
      // ),
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
