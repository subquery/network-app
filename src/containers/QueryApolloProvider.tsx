// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination, getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';

const getHttpLink = (uri: string | undefined) => new HttpLink({ uri });

export const SWAP_EXCHANGE_CLIENT = 'swapExchange';
const swapLink = getHttpLink(import.meta.env.VITE_QUERY_SWAP_EXCHANGE_PROJECT);

export const TOP_100_INDEXERS = 'top100Indexers';
const top100IndexersLink = getHttpLink(import.meta.env.VITE_TOP_100_INDEXERS);

const registryLink = getHttpLink(import.meta.env.VITE_QUERY_REGISTRY_PROJECT);

const registrySubLink = new WebSocketLink({
  uri: import.meta.env.VITE_SUBSCRIPTION_REGISTRY_PROJECT ?? '',
  options: {
    reconnect: true,
  },
});

export const QueryApolloProvider: React.FC<PropsWithChildren> = (props) => {
  const client = new ApolloClient({
    link: ApolloLink.split(
      (operation) => operation.getContext().clientName === SWAP_EXCHANGE_CLIENT,
      swapLink,
      ApolloLink.split(
        (operation) => operation.getContext().clientName === TOP_100_INDEXERS,
        top100IndexersLink,
        ApolloLink.split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
          },
          registrySubLink,
          registryLink,
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
