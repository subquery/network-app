// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import * as React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { IndexerProgress, ProjectHeader, ProjectOverview } from '../../../components';
import IndexerDetails from '../../../components/IndexerDetails';
import { useIndexersQuery } from '../../../containers';
import { useProject } from '../../../hooks';

const Project: React.VFC = () => {
  const { id, deployment: deploymentId } = useParams<{ id: string; deployment?: string }>();

  // TODO use a different version that relies on project rather than contracts
  const project = useProject(id);

  const {
    data: indexersQuery,
    loading: loadingIndexers,
    error: errorIndexers,
  } = useIndexersQuery({ deploymentId: deploymentId ?? project?.deployment.id });

  // TODO expand this to check status of indexers
  const hasIndexers = React.useMemo(() => indexersQuery?.indexers.nodes.length, [indexersQuery]);

  const indexersStatus = React.useMemo(() => {
    return (
      indexersQuery?.indexers.nodes.map((i) => ({
        indexer: i.indexer,
        latestBlock: BigNumber.from(i.blockHeight).toNumber(),
      })) ?? []
    );
  }, [indexersQuery]);

  if (!project) {
    return <span>Loading....</span>;
  }

  const renderIndexers = () => {
    if (loadingIndexers) {
      return <div>Loading....</div>;
    }

    if (errorIndexers) {
      return <div>{`Failed to load indexers: ${errorIndexers}`}</div>;
    }

    if (!indexersQuery?.indexers.nodes.length) {
      return <div>No indexers</div>;
    }

    return <IndexerDetails indexers={indexersQuery?.indexers.nodes} />;
  };

  const renderPlayground = () => {
    if (!hasIndexers) {
      return <Redirect from="/:id" to={`overview`} />;
    }

    return <div>Coming soon</div>;
    // return <Playground/>
  };

  return (
    <div>
      <ProjectHeader project={project} />

      <IndexerProgress
        startBlock={Math.min(...project.deployment.manifest.dataSources.map((ds) => ds.startBlock ?? 1))}
        chainBlockHeight={10000000000} // TODO get actual chain height
        indexerStatus={indexersStatus}
      />

      <div className="tabContainer">
        <NavLink to={`/explorer/project/${id}/overview`} className="tab" activeClassName="tabSelected" title="Overview">
          Overview
        </NavLink>
        <NavLink to={`/explorer/project/${id}/indexers`} className="tab" activeClassName="tabSelected" title="Indexers">
          Indexers
        </NavLink>
        {!!indexersQuery?.indexers.nodes.length && (
          <NavLink
            to={`/explorer/project/${id}/playground`}
            className="tab"
            activeClassName="tabSelected"
            title="Playground"
          >
            Playground
          </NavLink>
        )}
      </div>
      <Switch>
        <Route exact path={`/explorer/project/:id/:deployment?/overview`}>
          <ProjectOverview
            metadata={project.metadata}
            deploymentId={deploymentId ?? project.deployment.id}
            // TODO load correct date, probably need to switch to using query project rather than contract
            createdAt={new Date()}
            updatedAt={new Date()}
          />
        </Route>
        <Route exact path={`/explorer/project/:id/:deployment?/indexers`}>
          {renderIndexers()}
        </Route>
        <Route exact path={`/explorer/project/:id/:deployment?/playground`}>
          {renderPlayground()}
        </Route>
        <Redirect from="/:id" to={`${id}/overview`} />
      </Switch>
    </div>
  );
};

export default Project;
