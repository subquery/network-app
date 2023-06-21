// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { offsetLimitPagination } from '@apollo/client/utilities';
import { deploymentHttpLink } from '@subql/apollo-links';

const getHttpLink = (uri: string | undefined) => new HttpLink({ uri });

export const SWAP_EXCHANGE_CLIENT = 'swapExchange';

export const TOP_100_INDEXERS = 'top100Indexers';
const top100IndexersLink = getHttpLink(import.meta.env.VITE_TOP_100_INDEXERS);

const registryLink = getHttpLink(import.meta.env.VITE_QUERY_REGISTRY_PROJECT);

const getSwapLink = () => {
  const httpOptions = { fetch, fetchOptions: { timeout: 5000 } };

  return deploymentHttpLink({
    deploymentId: import.meta.env.VITE_SUBQUERY_DEPLOYMENT_ID,
    httpOptions,
    authUrl: import.meta.env.VITE_AUTH_URL,
    fallbackServiceUrl: import.meta.env.VITE_QUERY_SWAP_EXCHANGE_PROJECT,
  });
};

export const QueryApolloProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const client = new ApolloClient({
    link: ApolloLink.split(
      (operation) => operation.getContext().clientName === SWAP_EXCHANGE_CLIENT,
      getSwapLink(),
      ApolloLink.split(
        (operation) => operation.getContext().clientName === TOP_100_INDEXERS,
        top100IndexersLink,
        registryLink,
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

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};
