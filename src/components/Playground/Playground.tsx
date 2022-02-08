// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import styles from './Playground.module.css';
import GraphiQL from 'graphiql';
import { createGraphiQLFetcher } from '@graphiql/toolkit';
import { GraphQLSchema } from 'graphql';
import 'graphiql/graphiql.css';

type Props = {
  schema: GraphQLSchema;
  endpoint: string;
};

const Playground: React.VFC<Props> = ({ schema, endpoint }) => {
  const fetcher = React.useMemo(() => {
    // TODO need to get url form indexer
    return createGraphiQLFetcher({
      url: endpoint,
    });
  }, [endpoint]);

  return (
    <div className={styles.container}>
      <GraphiQL fetcher={fetcher} schema={schema} editorTheme="dracula">
        <GraphiQL.Logo>
          <div />
        </GraphiQL.Logo>
        <GraphiQL.Toolbar />
      </GraphiQL>
    </div>
  );
};

export default Playground;
