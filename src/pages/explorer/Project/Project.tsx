// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { ProjectHeader, ProjectOverview } from '../../../components';
import IndexerDetails from '../../../components/IndexerDetails';
import { useIndexersQuery } from '../../../containers';
import { useProject } from '../../../hooks';

const Project: React.VFC = () => {
  const { id, deployment: deploymentId } = useParams<{ id: string; deployment?: string }>();

  const project = useProject(id);

  const {
    data: indexersQuery,
    loading: loadingIndexers,
    error: errorIndexers,
  } = useIndexersQuery({ deploymentId: deploymentId ?? project?.deployment.id });

  // TODO expand this to check status of indexers
  const hasIndexers = React.useMemo(() => indexersQuery?.indexers.nodes.length, [indexersQuery]);

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

      <div className="tabContainer">
        <NavLink to={`/explorer/project/${id}/overview`} className="tab" activeClassName="tabSelected">
          Overview
        </NavLink>
        <NavLink to={`/explorer/project/${id}/indexers`} className="tab" activeClassName="tabSelected">
          Indexers
        </NavLink>
        {!!indexersQuery?.indexers.nodes.length && (
          <NavLink to={`/explorer/project/${id}/playground`} className="tab" activeClassName="tabSelected">
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
        <Redirect from="/:id" to={`overview`} />
      </Switch>
    </div>
  );
};

export default Project;
