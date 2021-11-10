// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useProjectsQuery } from '../../../containers';

const Home: React.VFC = () => {
  const { data, loading, error } = useProjectsQuery({ offset: 0 });

  return (
    <div>
      <p>EXPLORER</p>
      {error && <span>{`We have an error: ${error.message}`}</span>}
      {loading && <span>...loading</span>}
      {data && <span>{JSON.stringify(data.projects.nodes)}</span>}
    </div>
  );
};

export default Home;
