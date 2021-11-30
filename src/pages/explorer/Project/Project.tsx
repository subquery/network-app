// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BigNumber } from '@ethersproject/bignumber';
import * as React from 'react';
import { Redirect, Route, Switch, useHistory, useParams } from 'react-router';
import { NavLink } from 'react-router-dom';
import { IndexerProgress, NoIndexers, ProjectHeader, ProjectOverview, Spinner } from '../../../components';
import IndexerDetails from '../../../components/IndexerDetails';
import { useDeploymentsQuery, useIndexersQuery, useProjectMetadata } from '../../../containers';
import { useAsyncMemo, useDeploymentMetadata, useProjectFromQuery, useRouteQuery } from '../../../hooks';
import { notEmpty, renderAsync } from '../../../utils';
import styles from './Project.module.css';

export const ROUTE = '/explorer/project';

const Project: React.VFC = () => {
  const { id } = useParams<{ id: string }>();
  const query = useRouteQuery();
  const history = useHistory();
  const { getVersionMetadata } = useProjectMetadata();

  const asyncProject = useProjectFromQuery(id);
  const { data: deployments } = useDeploymentsQuery({ projectId: id });

  const deploymentId = query.get('deploymentId') || asyncProject.data?.currentDeployment;

  const asyncIndexers = useIndexersQuery(deploymentId ? { deploymentId } : undefined);

  // TODO expand this to check status of indexers
  const indexers = React.useMemo(() => asyncIndexers.data?.indexers?.nodes.filter(notEmpty), [asyncIndexers.data]);
  const hasIndexers = React.useMemo(() => !!indexers?.length, [indexers]);

  // TODO get from an indexer
  const chainBlockHeight = 10000000000;

  const indexersStatus = React.useMemo(() => {
    return (
      indexers?.map((i) => ({
        indexer: i.indexer,
        latestBlock: BigNumber.from(i.blockHeight).toNumber(),
      })) ?? []
    );
  }, [indexers]);

  const { data: deploymentVersions } = useAsyncMemo(async () => {
    const deploymentsWithSemver = await Promise.all(
      (deployments?.projectDeployments?.nodes ?? [])
        .filter(notEmpty)
        .map((v) => v.deployment)
        .filter(notEmpty)
        .map((d) => getVersionMetadata(d.version).then((versionMeta) => ({ id: d.id, version: versionMeta.version }))),
    );

    return deploymentsWithSemver.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.version }), {});
  }, [deployments]);

  const asyncDeploymentMetadata = useDeploymentMetadata(deploymentId);

  const handleChangeVersion = (value: string) => {
    history.push(`${history.location.pathname}?deploymentId=${value}`);
  };

  const renderIndexers = () => {
    return renderAsync(asyncIndexers, {
      loading: () => <Spinner />,
      error: (e) => <div>{`Failed to load indexers: ${e.message}`}</div>,
      data: () => {
        if (!indexers?.length) {
          return <NoIndexers />;
        }

        return <IndexerDetails indexers={indexers} targetBlock={chainBlockHeight} />;
      },
    });
  };

  const renderPlayground = () => {
    if (!hasIndexers) {
      return <Redirect from="/:id" to={`overview`} />;
    }

    return <div>Coming soon</div>;
    // return <Playground/>
  };

  return renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (e) => <span>{`Failed to load project: ${e.message}`}</span>,
    data: (project) => {
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      return (
        <div>
          <div className={styles.upper}>
            <div className="content-width">
              <ProjectHeader
                project={project}
                versions={deploymentVersions}
                currentVersion={deploymentId}
                onChangeVersion={handleChangeVersion}
              />

              <IndexerProgress
                startBlock={/*Math.min(...project.deployment.manifest.dataSources.map((ds) => ds.startBlock ?? 1))*/ 1}
                chainBlockHeight={chainBlockHeight}
                indexerStatus={indexersStatus}
                containerClassName={styles.progress}
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
                {hasIndexers && (
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
            </div>
          </div>
          <div className="content-width">
            <Switch>
              <Route exact path={`${ROUTE}/:id/overview`}>
                <ProjectOverview
                  metadata={project.metadata}
                  deploymentDescription={asyncDeploymentMetadata?.data?.description}
                  createdAt={project.createdTimestamp}
                  updatedAt={project.updatedTimestamp}
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
        </div>
      );
    },
  });
};

export default Project;
