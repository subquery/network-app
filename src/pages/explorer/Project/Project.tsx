// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import * as React from 'react';
import { Redirect, Route, Switch, useHistory, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { IndexerProgress, ProjectHeader, ProjectOverview } from '../../../components';
import IndexerDetails from '../../../components/IndexerDetails';
import { useDeploymentsQuery, useIndexersQuery, useProjectMetadata } from '../../../containers';
import { useAsyncMemo, useProjectFromQuery, useRouteQuery } from '../../../hooks';

export const ROUTE = '/explorer/project';

const Project: React.VFC = () => {
  const { id } = useParams<{ id: string }>();
  const query = useRouteQuery();
  const history = useHistory();
  const { getVersionMetadata } = useProjectMetadata();

  const deploymentId = query.get('deploymentId') || undefined;

  const { data: project, loading, error } = useProjectFromQuery(id);
  const { data: deployments } = useDeploymentsQuery({ projectId: id });

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

  const { data: deploymentVersions } = useAsyncMemo(async () => {
    const deploymentsWithSemver = await Promise.all(
      (deployments?.projectDeployments.nodes ?? [])
        .map((v) => v.deployment)
        .map((d) => getVersionMetadata(d.version).then((versionMeta) => ({ id: d.id, version: versionMeta.version }))),
    );

    return deploymentsWithSemver.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.version }), {});

    // TODO resolve ipfs version
  }, [deployments]);

  const handleChangeVersion = (value: string) => {
    // TODO retain current
    history.push(`${history.location.pathname}?deploymentId=${value}`);
  };

  if (loading) {
    return <span>Loading....</span>;
  }

  if (error) {
    return <span>{`Failed to load project: ${error.message}`}</span>;
  }

  if (!project) {
    // Should never happen
    return <span>Project doesn't exist</span>;
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
      <ProjectHeader
        project={project}
        versions={deploymentVersions}
        currentVersion={deploymentId}
        onChangeVersion={handleChangeVersion}
      />

      <IndexerProgress
        startBlock={Math.min(...project.deployment.manifest.dataSources.map((ds) => ds.startBlock ?? 1))}
        chainBlockHeight={10000000000} // TODO get actual chain height
        indexerStatus={indexersStatus}
      />

      <div className="tabContainer">
        <NavLink
          to={`${ROUTE}/${id}/overview${history.location.search}`}
          className="tab"
          activeClassName="tabSelected"
          title="Overview"
        >
          Overview
        </NavLink>
        <NavLink
          to={`${ROUTE}/${id}/indexers${history.location.search}`}
          className="tab"
          activeClassName="tabSelected"
          title="Indexers"
        >
          Indexers
        </NavLink>
        {!!indexersQuery?.indexers.nodes.length && (
          <NavLink
            to={`${ROUTE}/${id}/playground${history.location.search}`}
            className="tab"
            activeClassName="tabSelected"
            title="Playground"
          >
            Playground
          </NavLink>
        )}
      </div>
      <Switch>
        <Route exact path={`${ROUTE}/:id/overview`}>
          <ProjectOverview
            metadata={project.metadata}
            deploymentId={deploymentId ?? project.deployment.id}
            // TODO load correct date, probably need to switch to using query project rather than contract
            createdAt={project.createdAt}
            updatedAt={project.updatedAt}
          />
        </Route>
        <Route exact path={`${ROUTE}/:id/indexers`}>
          {renderIndexers()}
        </Route>
        <Route exact path={`${ROUTE}/:id/playground`}>
          {renderPlayground()}
        </Route>
        <Redirect from="/:id" to={`${id}/overview${history.location.search}`} />
      </Switch>
    </div>
  );
};

export default Project;
