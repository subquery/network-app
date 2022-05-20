// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './GraphQLPlayground.module.css';
import GraphiQL from 'graphiql';
import 'graphiql/graphiql.css';

export const defaultQuery = ` 
query {
  _metadata {
    indexerHealthy
    indexerNodeVersion
  }
}

`;

type Props = {
  schema?: string;
  endpoint: string;
  token?: string;
};

export const GraphQLPlayground: React.VFC<Props> = ({ endpoint, token }) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  console.log('GraphQLPlayground', endpoint);

  const sortedHeaders = token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
  return (
    <div className={styles.container}>
      <GraphiQL
        defaultQuery={defaultQuery}
        fetcher={async (graphQLParams) => {
          const data = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(graphQLParams),
          });
          return data.json().catch(() => data.text());
        }}
      />
    </div>
  );
};
