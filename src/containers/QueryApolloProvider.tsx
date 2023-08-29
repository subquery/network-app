// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { PropsWithChildren } from 'react';
import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { offsetLimitPagination } from '@apollo/client/utilities';
import { captureException } from '@sentry/react';
import { deploymentHttpLink } from '@subql/apollo-links';

const getHttpLink = (uri: string | undefined) => new HttpLink({ uri });

export const SWAP_EXCHANGE_CLIENT = 'swapExchange';

export const TOP_100_INDEXERS = 'top100Indexers';
const top100IndexersLink = getHttpLink(import.meta.env.VITE_TOP_100_INDEXERS);

const getDecentraliseLink = (deploymentId: string, fallbackServiceUrl?: string) => {
  const httpOptions = { fetch, fetchOptions: { timeout: 5000 } };

  // this is just a test env varible set in your local env file.
  if (import.meta.env.VITE_USE_FALLBACKURL) {
    return getHttpLink(fallbackServiceUrl);
  }

  return deploymentHttpLink({
    deploymentId,
    httpOptions,
    authUrl: import.meta.env.VITE_AUTH_URL,
    fallbackServiceUrl,
  }).link;
};

export const swapLink = getDecentraliseLink(
  import.meta.env.VITE_EXCHANGE_DEPLOYMENT_ID,
  import.meta.env.VITE_QUERY_SWAP_EXCHANGE_PROJECT,
);

export const networkLink = getDecentraliseLink(
  import.meta.env.VITE_NETWORK_DEPLOYMENT_ID,
  import.meta.env.VITE_QUERY_REGISTRY_PROJECT,
);

const links = ApolloLink.from([
  onError(({ graphQLErrors, operation }) => {
    // Filter consumer by community.
    // If community link goes error, apollo-links will try until all failed.
    // So Just catch the error caused by fallback service.
    try {
      const {
        response: { url },
      } = operation.getContext();

      if (url && url.match(/.+\/(query)|(payg)\/[0-9a-zA-Z]{46}/)) return;
    } finally {
      // don't care there have errors.
    }

    captureException(`Query fetch`, {
      extra: {
        graphqlError: graphQLErrors?.reduce((a, b) => ({ message: a.message + ' ' + b.message }), { message: '' })
          .message,
        operation: operation.query.loc?.source.body,
      },
    });
  }),
  ApolloLink.split(
    (operation) => operation.getContext().clientName === SWAP_EXCHANGE_CLIENT,
    swapLink,

    ApolloLink.split(
      (operation) => operation.getContext().clientName === TOP_100_INDEXERS,
      top100IndexersLink,

      networkLink,
    ),
  ),
]);

export const QueryApolloProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const client = new ApolloClient({
    link: links,
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
